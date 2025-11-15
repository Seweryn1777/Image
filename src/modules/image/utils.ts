import sharp from 'sharp'
import { BadRequestException, Logger } from '@nestjs/common'
import { enUS } from 'lib/locale'
import { R } from 'lib/utils'
import { ResizeImageParams } from './types'

const T = enUS
const logger = new Logger('resizeImage')

export const resizeImage = async (params: ResizeImageParams) => {
  const { buffer, width: targetWidth, height: targetHeight } = params

  try {
    const metadata = await sharp(buffer).metadata()

    if (R.isDefined(targetWidth) && R.isDefined(targetHeight)) {
      const resizedBuffer = await sharp(buffer)
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .toBuffer()

      return {
        buffer: resizedBuffer,
        width: targetWidth,
        height: targetHeight
      }
    }

    if (R.isDefined(targetWidth)) {
      const sharpInstance = sharp(buffer).resize(targetWidth, null, {
        fit: 'inside'
      })
      const resizedMetadata = await sharpInstance.metadata()
      const resizedBuffer = await sharpInstance.toBuffer()

      return {
        buffer: resizedBuffer,
        width: targetWidth,
        height: resizedMetadata.height
      }
    }

    if (R.isDefined(targetHeight)) {
      const sharpInstance = sharp(buffer).resize(null, targetHeight, {
        fit: 'inside'
      })
      const resizedMetadata = await sharpInstance.metadata()
      const resizedBuffer = await sharpInstance.toBuffer()

      return {
        buffer: resizedBuffer,
        width: resizedMetadata.width,
        height: targetHeight
      }
    }

    return {
      buffer,
      width: metadata.width,
      height: metadata.height
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message, error.stack)
    }

    throw new BadRequestException(T.image.resizeFailed)
  }
}
