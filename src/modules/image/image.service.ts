import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'node:crypto'
import { ImageEntity } from 'lib/entities'
import { Image } from 'lib/types'
import { enUS } from 'lib/locale'
import { R } from 'lib/utils'
import { StorageService } from 'modules/storage'
import { UploadImageDto, ListImagesDto } from './dto'
import { resizeImage } from './utils'
import { IMAGE_PREFIX } from './constants'

const T = enUS

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name)

  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
    private readonly storageService: StorageService
  ) {}

  async uploadImage(dto: UploadImageDto, file: Express.Multer.File) {
    const resizedImage = await resizeImage({
      buffer: file.buffer,
      width: dto.width,
      height: dto.height
    })
    const { buffer, width, height } = resizedImage

    const { key } = await this.storageService.put(
      IMAGE_PREFIX,
      buffer,
      file.originalname
    )

    try {
      const imageUUID = randomUUID()
      const image = this.imageRepository.create({
        imageUUID,
        title: dto.title,
        storageKey: key,
        width,
        height,
        mimeType: file.mimetype,
        size: buffer.length
      })

      await this.imageRepository.insert(image)

      return { imageUUID }
    } catch (error) {
      if (R.isDefined(key)) {
        await this.storageService.delete(key)
      }

      if (error instanceof Error) {
        this.logger.error(error.message, error.stack)
      }

      throw new BadRequestException(T.image.uploadFailed)
    }
  }

  async listImages(dto: ListImagesDto) {
    const { search, limit, offset, orderBy, orderWay } = dto

    const sql = this.imageRepository.createQueryBuilder('I')

    if (R.isDefined(search)) {
      sql.where('I.title ILIKE :title', { title: `%${search}%` })
    }

    sql.limit(limit).offset(offset).orderBy(`I.${orderBy}`, orderWay)

    const [items, count] = await sql.getManyAndCount()
    const itemsWithUrl = await this.addSignedUrls(items)

    return {
      images: itemsWithUrl,
      count
    }
  }

  async getImageById(imageUUID: string) {
    const image = await this.imageRepository.findOne({ where: { imageUUID } })

    if (!R.isDefined(image)) {
      throw new NotFoundException(T.image.notFound)
    }

    const { storageKey, ...rest } = image
    const url = await this.storageService.getSignedUrl(storageKey)

    return { ...rest, url }
  }

  private addSignedUrls(images: Array<Image>) {
    return Promise.all(
      images.map(async image => {
        const { storageKey, ...rest } = image
        const url = await this.storageService.getSignedUrl(storageKey)

        return {
          ...rest,
          url
        }
      })
    )
  }
}
