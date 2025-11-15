import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ImageService } from './image.service'
import { UploadImageDto, ListImagesDto, ImageDto } from './dto'
import { IMAGE } from './constants'
import { ImageModel, ListImagesResponse } from './responses'

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Body() dto: UploadImageDto,
    @UploadedFile(IMAGE) file: Express.Multer.File
  ) {
    return this.imageService.uploadImage(dto, file)
  }

  @Get()
  listImages(@Query() dto: ListImagesDto): Promise<ListImagesResponse> {
    return this.imageService.listImages(dto)
  }

  @Get(':imageUUID')
  getImageById(@Param() dto: ImageDto): Promise<ImageModel> {
    return this.imageService.getImageById(dto.imageUUID)
  }
}
