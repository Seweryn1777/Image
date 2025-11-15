/* eslint-disable functional/no-let */
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Readable } from 'node:stream'
import { ImageEntity } from 'lib/entities'
import { ImageService } from './image.service'
import { StorageService } from 'modules/storage'
import { UploadImageDto, ListImagesDto } from './dto'
import { OrderWay } from 'lib/enums'
import { ImageOrderBy } from './enums'

jest.mock('./utils', () => ({
  resizeImage: jest.fn()
}))

const { resizeImage } = require('./utils')

describe('ImageService', () => {
  let service: ImageService

  const mockStorageService = {
    put: jest.fn(),
    delete: jest.fn(),
    getSignedUrl: jest.fn()
  }

  const mockImageRepository = {
    create: jest.fn(),
    insert: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn()
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: getRepositoryToken(ImageEntity),
          useValue: mockImageRepository
        },
        {
          provide: StorageService,
          useValue: mockStorageService
        }
      ]
    }).compile()

    module.useLogger(false)
    service = module.get<ImageService>(ImageService)

    jest.clearAllMocks()
  })

  describe('uploadImage', () => {
    const dto: UploadImageDto = {
      title: 'Test Image',
      width: 800,
      height: 600
    }

    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('fake-image'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      fieldname: 'image',
      encoding: '7bit',
      size: 1024,
      stream: Readable.from(''),
      destination: '',
      filename: '',
      path: ''
    }

    const mockResizedImage = {
      buffer: Buffer.from('resized-image'),
      width: 800,
      height: 600
    }

    const mockStorageKey = 'images/uuid/test.jpg'

    beforeEach(() => {
      resizeImage.mockResolvedValue(mockResizedImage)
      mockStorageService.put.mockResolvedValue({ key: mockStorageKey })
    })

    it('should upload image successfully', async () => {
      const mockImage = {
        imageUUID: 'test-uuid',
        title: dto.title,
        storageKey: mockStorageKey,
        width: mockResizedImage.width,
        height: mockResizedImage.height,
        mimeType: mockFile.mimetype,
        size: mockResizedImage.buffer.length
      }

      mockImageRepository.create.mockReturnValue(mockImage)
      mockImageRepository.insert.mockResolvedValue({
        identifiers: [{ imageUUID: 'test-uuid' }]
      })

      const result = await service.uploadImage(dto, mockFile)

      expect(resizeImage).toHaveBeenCalledWith({
        buffer: mockFile.buffer,
        width: dto.width,
        height: dto.height
      })

      expect(mockStorageService.put).toHaveBeenCalledWith(
        'images',
        mockResizedImage.buffer,
        mockFile.originalname
      )

      expect(mockImageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: dto.title,
          storageKey: mockStorageKey,
          width: mockResizedImage.width,
          height: mockResizedImage.height,
          mimeType: mockFile.mimetype,
          size: mockResizedImage.buffer.length
        })
      )

      expect(mockImageRepository.insert).toHaveBeenCalledWith(mockImage)
      expect(result).toHaveProperty('imageUUID')
    })

    it('should upload image without width and height', async () => {
      const dtoNoResize: UploadImageDto = { title: 'No Resize Image' }
      const originalSize = {
        buffer: Buffer.from('original'),
        width: 1920,
        height: 1080
      }

      resizeImage.mockResolvedValue(originalSize)
      mockImageRepository.create.mockReturnValue({})
      mockImageRepository.insert.mockResolvedValue({})

      await service.uploadImage(dtoNoResize, mockFile)

      expect(resizeImage).toHaveBeenCalledWith({
        buffer: mockFile.buffer,
        width: undefined,
        height: undefined
      })
    })

    it('should delete storage file if database insert fails', async () => {
      const mockImage = {
        imageUUID: 'test-uuid',
        title: dto.title,
        storageKey: mockStorageKey,
        width: mockResizedImage.width,
        height: mockResizedImage.height,
        mimeType: mockFile.mimetype,
        size: mockResizedImage.buffer.length
      }

      mockImageRepository.create.mockReturnValue(mockImage)
      mockImageRepository.insert.mockRejectedValue(new Error('Database error'))

      await expect(service.uploadImage(dto, mockFile)).rejects.toThrow(
        BadRequestException
      )

      expect(mockStorageService.delete).toHaveBeenCalledWith(mockStorageKey)
    })

    it('should handle resize failure', async () => {
      resizeImage.mockRejectedValue(new Error('Resize failed'))

      await expect(service.uploadImage(dto, mockFile)).rejects.toThrow()
      expect(mockStorageService.put).not.toHaveBeenCalled()
    })

    it('should handle storage upload failure', async () => {
      mockStorageService.put.mockRejectedValue(new Error('Storage error'))

      await expect(service.uploadImage(dto, mockFile)).rejects.toThrow()
      expect(mockImageRepository.insert).not.toHaveBeenCalled()
    })

    it('should create image with correct buffer size', async () => {
      const largeBuffer = Buffer.from('a'.repeat(5000))
      resizeImage.mockResolvedValue({
        buffer: largeBuffer,
        width: 800,
        height: 600
      })

      mockImageRepository.create.mockReturnValue({})
      mockImageRepository.insert.mockResolvedValue({})

      await service.uploadImage(dto, mockFile)

      expect(mockImageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          size: largeBuffer.length
        })
      )
    })
  })

  describe('listImages', () => {
    const dto: ListImagesDto = {
      limit: 25,
      offset: 0,
      orderBy: ImageOrderBy.CreatedAt,
      orderWay: OrderWay.DESC
    }

    const mockImages = [
      {
        imageUUID: 'uuid-1',
        title: 'Image 1',
        storageKey: 'images/uuid/img1.jpg',
        width: 800,
        height: 600,
        mimeType: 'image/jpeg',
        size: 1024
      },
      {
        imageUUID: 'uuid-2',
        title: 'Image 2',
        storageKey: 'images/uuid/img2.jpg',
        width: 1920,
        height: 1080,
        mimeType: 'image/png',
        size: 2048
      }
    ]

    it('should list images without search filter', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockImages, 2])
      }

      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockStorageService.getSignedUrl.mockResolvedValue(
        'https://signed-url.com/image.jpg'
      )

      const result = await service.listImages(dto)

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(dto.limit)
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(dto.offset)
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        `I.${dto.orderBy}`,
        dto.orderWay
      )
      expect(mockQueryBuilder.where).not.toHaveBeenCalled()

      expect(result).toEqual({
        images: expect.arrayContaining([
          expect.objectContaining({
            imageUUID: 'uuid-1',
            title: 'Image 1',
            url: 'https://signed-url.com/image.jpg'
          }),
          expect.objectContaining({
            imageUUID: 'uuid-2',
            title: 'Image 2',
            url: 'https://signed-url.com/image.jpg'
          })
        ]),
        count: 2
      })

      expect(result.images[0]).not.toHaveProperty('storageKey')
      expect(result.images[1]).not.toHaveProperty('storageKey')
    })

    it('should list images with search filter', async () => {
      const searchDto: ListImagesDto = {
        ...dto,
        search: 'test'
      }

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockImages[0]], 1])
      }

      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockStorageService.getSignedUrl.mockResolvedValue(
        'https://signed-url.com/image.jpg'
      )

      const result = await service.listImages(searchDto)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'I.title ILIKE :title',
        {
          title: `%${searchDto.search}%`
        }
      )
      expect(result.count).toBe(1)
    })

    it('should return empty array when no images found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0])
      }

      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.listImages(dto)

      expect(result).toEqual({
        images: [],
        count: 0
      })
    })

    it('should handle different order by fields', async () => {
      const customDto: ListImagesDto = {
        ...dto,
        orderBy: ImageOrderBy.Title,
        orderWay: OrderWay.ASC
      }

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0])
      }

      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      await service.listImages(customDto)

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        `I.${ImageOrderBy.Title}`,
        OrderWay.ASC
      )
    })

    it('should handle custom limit and offset', async () => {
      const customDto: ListImagesDto = {
        ...dto,
        limit: 10,
        offset: 20
      }

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0])
      }

      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      await service.listImages(customDto)

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10)
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(20)
    })

    it('should generate signed URLs for all images', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockImages, 2])
      }

      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockStorageService.getSignedUrl
        .mockResolvedValueOnce('https://url1.com')
        .mockResolvedValueOnce('https://url2.com')

      const result = await service.listImages(dto)

      expect(mockStorageService.getSignedUrl).toHaveBeenCalledTimes(2)
      expect(mockStorageService.getSignedUrl).toHaveBeenNthCalledWith(
        1,
        'images/uuid/img1.jpg'
      )
      expect(mockStorageService.getSignedUrl).toHaveBeenNthCalledWith(
        2,
        'images/uuid/img2.jpg'
      )
      expect(result.images[0].url).toBe('https://url1.com')
      expect(result.images[1].url).toBe('https://url2.com')
    })
  })

  describe('getImageById', () => {
    const imageUUID = 'test-uuid'
    const mockImage = {
      imageUUID,
      title: 'Test Image',
      storageKey: 'images/uuid/test.jpg',
      width: 800,
      height: 600,
      mimeType: 'image/jpeg',
      size: 1024
    }

    it('should return image with signed url', async () => {
      const mockSignedUrl = 'https://signed-url.com/test.jpg'

      mockImageRepository.findOne.mockResolvedValue(mockImage)
      mockStorageService.getSignedUrl.mockResolvedValue(mockSignedUrl)

      const result = await service.getImageById(imageUUID)

      expect(mockImageRepository.findOne).toHaveBeenCalledWith({
        where: { imageUUID }
      })

      expect(mockStorageService.getSignedUrl).toHaveBeenCalledWith(
        mockImage.storageKey
      )

      expect(result).toEqual({
        imageUUID,
        title: 'Test Image',
        width: 800,
        height: 600,
        mimeType: 'image/jpeg',
        size: 1024,
        url: mockSignedUrl
      })

      expect(result).not.toHaveProperty('storageKey')
    })

    it('should throw NotFoundException when image does not exist', async () => {
      mockImageRepository.findOne.mockResolvedValue(null)

      await expect(service.getImageById(imageUUID)).rejects.toThrow(
        NotFoundException
      )

      expect(mockImageRepository.findOne).toHaveBeenCalledWith({
        where: { imageUUID }
      })

      expect(mockStorageService.getSignedUrl).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException with correct message', async () => {
      mockImageRepository.findOne.mockResolvedValue(null)

      await expect(service.getImageById('non-existent-uuid')).rejects.toThrow(
        'Image not found'
      )
    })

    it('should handle different image types', async () => {
      const pngImage = {
        ...mockImage,
        mimeType: 'image/png'
      }

      mockImageRepository.findOne.mockResolvedValue(pngImage)
      mockStorageService.getSignedUrl.mockResolvedValue('https://url.com')

      const result = await service.getImageById(imageUUID)

      expect(result.mimeType).toBe('image/png')
    })

    it('should handle different image sizes', async () => {
      const largeImage = {
        ...mockImage,
        width: 4096,
        height: 2160,
        size: 10485760
      }

      mockImageRepository.findOne.mockResolvedValue(largeImage)
      mockStorageService.getSignedUrl.mockResolvedValue('https://url.com')

      const result = await service.getImageById(imageUUID)

      expect(result.width).toBe(4096)
      expect(result.height).toBe(2160)
      expect(result.size).toBe(10485760)
    })
  })
})
