import { Image } from 'lib/types'

export type ImageWithUrl = Image & {
  url: string
}

export type ResizeImageParams = {
  buffer: Buffer
  width?: number
  height?: number
}
