import { IsUUID } from 'class-validator'

export class ImageDto {
  @IsUUID(4)
  readonly imageUUID: string
}
