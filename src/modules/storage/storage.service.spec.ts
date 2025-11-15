/* eslint-disable functional/no-let */
import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { StorageService } from './storage.service'

jest.mock('@aws-sdk/client-s3')
jest.mock('@aws-sdk/s3-request-presigner')
jest.mock('lib/config')

const { getConfig } = require('lib/config')

describe('StorageService', () => {
  let service: StorageService
  let mockS3Send: jest.Mock

  const mockConfig = {
    storageConfig: {
      bucket: 'test-bucket',
      options: {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret'
        }
      }
    }
  }

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  beforeEach(async () => {
    ;(getConfig as jest.Mock).mockReturnValue(mockConfig)

    mockS3Send = jest.fn()

    const mockS3Client = {
      send: mockS3Send
    }

    ;(S3Client as jest.MockedClass<typeof S3Client>).mockImplementation(
      () => mockS3Client as unknown as S3Client
    )

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService]
    }).compile()

    module.useLogger(false)
    service = module.get<StorageService>(StorageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('put', () => {
    it('should upload file to S3 successfully', async () => {
      const prefix = 'images'
      const body = Buffer.from('test-image-data')
      const fileName = 'test.jpg'

      mockS3Send.mockResolvedValue({})

      const result = await service.put(prefix, body, fileName)

      expect(mockS3Send).toHaveBeenCalledTimes(1)
      expect(mockS3Send).toHaveBeenCalledWith(expect.any(PutObjectCommand))

      expect(result).toHaveProperty('key')
      expect(result).toHaveProperty('url')
      expect(result.key).toContain(prefix)
      expect(result.key).toContain(fileName)
    })

    it('should generate unique keys for each upload', async () => {
      const prefix = 'images'
      const body = Buffer.from('test')
      const fileName = 'test.jpg'

      mockS3Send.mockResolvedValue({})

      const result1 = await service.put(prefix, body, fileName)
      const result2 = await service.put(prefix, body, fileName)

      expect(result1.key).not.toBe(result2.key)
    })

    it('should throw BadRequestException on S3 error', async () => {
      const prefix = 'images'
      const body = Buffer.from('test')
      const fileName = 'test.jpg'

      mockS3Send.mockRejectedValue(new Error('S3 upload failed'))

      await expect(service.put(prefix, body, fileName)).rejects.toThrow(
        BadRequestException
      )
    })

    it('should handle different file types', async () => {
      const testCases = [
        { prefix: 'images', fileName: 'photo.png' },
        { prefix: 'images', fileName: 'graphic.webp' },
        { prefix: 'documents', fileName: 'file.pdf' }
      ]

      mockS3Send.mockResolvedValue({})

      const results = await Promise.all(
        testCases.map(({ prefix, fileName }) =>
          service.put(prefix, Buffer.from('test'), fileName)
        )
      )

      results.forEach((result, index) => {
        expect(result.key).toContain(testCases[index].fileName)
      })
    })

    it('should handle large buffers', async () => {
      const prefix = 'images'
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024) // 10MB
      const fileName = 'large.jpg'

      mockS3Send.mockResolvedValue({})

      const result = await service.put(prefix, largeBuffer, fileName)

      expect(result).toHaveProperty('key')
      expect(mockS3Send).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    })
  })

  describe('delete', () => {
    it('should delete file from S3 successfully', async () => {
      const key = 'images/test-uuid/test.jpg'

      mockS3Send.mockResolvedValue({})

      const result = await service.delete(key)

      expect(mockS3Send).toHaveBeenCalledTimes(1)
      expect(mockS3Send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))

      expect(result).toEqual({ key })
    })

    it('should throw BadRequestException on S3 error', async () => {
      const key = 'images/test-uuid/test.jpg'

      mockS3Send.mockRejectedValue(new Error('S3 delete failed'))

      await expect(service.delete(key)).rejects.toThrow(BadRequestException)
    })

    it('should handle multiple delete operations', async () => {
      const keys = [
        'images/uuid1/file1.jpg',
        'images/uuid2/file2.png',
        'images/uuid3/file3.webp'
      ]

      mockS3Send.mockResolvedValue({})

      const results = await Promise.all(keys.map(key => service.delete(key)))

      results.forEach((result, index) => {
        expect(result.key).toBe(keys[index])
      })

      expect(mockS3Send).toHaveBeenCalledTimes(keys.length)
    })
  })

  describe('getSignedUrl', () => {
    it('should generate signed URL successfully', async () => {
      const key = 'images/test-uuid/test.jpg'
      const mockSignedUrl = 'https://test-bucket.s3.amazonaws.com/signed-url'

      ;(getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl)

      const result = await service.getSignedUrl(key)

      expect(getSignedUrl).toHaveBeenCalledTimes(1)
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 3600 }
      )

      expect(result).toBe(mockSignedUrl)
    })

    it('should use custom expiration time', async () => {
      const key = 'images/test-uuid/test.jpg'
      const customExpiration = 7200
      const mockSignedUrl = 'https://signed-url.com'

      ;(getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl)

      await service.getSignedUrl(key, customExpiration)

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: customExpiration }
      )
    })

    it('should use default expiration when not specified', async () => {
      const key = 'images/test-uuid/test.jpg'
      const mockSignedUrl = 'https://signed-url.com'

      ;(getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl)

      await service.getSignedUrl(key)

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 3600 }
      )
    })

    it('should throw BadRequestException on error', async () => {
      const key = 'images/test-uuid/test.jpg'

      ;(getSignedUrl as jest.Mock).mockRejectedValue(
        new Error('Failed to generate URL')
      )

      await expect(service.getSignedUrl(key)).rejects.toThrow(
        BadRequestException
      )
    })

    it('should handle multiple signed URL requests', async () => {
      const keys = ['images/1.jpg', 'images/2.jpg', 'images/3.jpg']
      const urls = keys.map((_, i) => `https://signed-url-${i}.com`)

      ;(getSignedUrl as jest.Mock)
        .mockResolvedValueOnce(urls[0])
        .mockResolvedValueOnce(urls[1])
        .mockResolvedValueOnce(urls[2])

      const results = await Promise.all(
        keys.map(key => service.getSignedUrl(key))
      )

      expect(results).toEqual(urls)
      expect(getSignedUrl).toHaveBeenCalledTimes(3)
    })

    it('should generate signed URLs with different keys', async () => {
      const keys = ['images/1.jpg', 'images/2.jpg']

      ;(getSignedUrl as jest.Mock)
        .mockResolvedValueOnce('https://url-1.com')
        .mockResolvedValueOnce('https://url-2.com')

      const result1 = await service.getSignedUrl(keys[0])
      const result2 = await service.getSignedUrl(keys[1])

      expect(result1).not.toBe(result2)
      expect(getSignedUrl).toHaveBeenCalledTimes(2)
    })
  })

  describe('constructor', () => {
    it('should initialize S3Client with correct config', () => {
      expect(S3Client).toHaveBeenCalledWith(mockConfig.storageConfig.options)
    })

    it('should set bucket from config', () => {
      const serviceWithBucket = service as unknown as { bucket: string }
      expect(serviceWithBucket.bucket).toBe('test-bucket')
    })
  })
})
