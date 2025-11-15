import { SetMetadata } from '@nestjs/common'
import { DecoratorName } from '../common'

export const Public = (isPublic: boolean = true) =>
  SetMetadata(DecoratorName.Public, isPublic)
