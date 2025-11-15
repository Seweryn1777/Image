import { FileValidator } from '@nestjs/common'
import { R } from 'lib/utils'

export class ImageFileTypeValidator extends FileValidator<{
  allowedMimeTypes: Array<string>
}> {
  buildErrorMessage(): string {
    return `Validation failed (expected type is ${this.validationOptions.allowedMimeTypes.join(', ')})`
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!R.isDefined(file?.mimetype)) {
      return false
    }

    const mimeType = file.mimetype.toLowerCase().split(';')[0].trim()

    return this.validationOptions.allowedMimeTypes.includes(mimeType)
  }
}
