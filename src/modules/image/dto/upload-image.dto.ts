import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class UploadImageDto {
  @IsString()
  @Length(1, 255)
  readonly title: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8192)
  readonly width?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8192)
  readonly height?: number
}
