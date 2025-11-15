import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min
} from 'class-validator'
import { OrderWay } from 'lib/enums'
import { ImageOrderBy } from '../enums'

export class ListImagesDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  readonly search?: string

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(500)
  readonly limit: number = 25

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly offset: number = 0

  @IsOptional()
  @IsEnum(ImageOrderBy)
  @Length(1, 255)
  readonly orderBy: ImageOrderBy = ImageOrderBy.CreatedAt

  @IsOptional()
  @IsEnum(OrderWay)
  readonly orderWay: OrderWay = OrderWay.DESC
}
