import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common'
import { getConfig } from 'lib/config'
import { ImageFileTypeValidator } from '../../lib/validators/image-file-type.validator'

export const IMAGE_PREFIX = 'images'

export const IMAGE = new ParseFilePipeBuilder()
  .addValidator(
    new ImageFileTypeValidator({
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
    })
  )
  .addMaxSizeValidator({
    maxSize: getConfig().uploadConfig.filesize
  })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
  })
