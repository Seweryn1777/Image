import { randomUUID } from 'node:crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { getConfig } from 'lib/config'

@Injectable()
export class StorageService {
  private readonly bucket: string
  private readonly client: S3Client
  private readonly logger = new Logger(StorageService.name)

  constructor() {
    const { storageConfig } = getConfig()
    const { bucket, options } = storageConfig
    this.bucket = bucket
    this.client = new S3Client(options)
  }

  put(prefix: string, body: Buffer, fileName: string) {
    const key = `${prefix}/${randomUUID()}/${fileName}`
    const bucket = this.bucket
    const command = new PutObjectCommand({
      Bucket: bucket,
      Body: body,
      Key: key
    })

    return this.client
      .send(command)
      .then(() => ({ url: `${bucket}/${key}`, key }))
      .catch(error => {
        this.logger.error(error.message, error.stack)
        throw new BadRequestException()
      })
  }

  delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    })

    return this.client
      .send(command)
      .then(() => ({ key }))
      .catch(error => {
        this.logger.error(error)

        throw new BadRequestException()
      })
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600) {
    const bucket = this.bucket
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds
    }).catch(error => {
      this.logger.error(error)

      throw new BadRequestException()
    })
  }
}
