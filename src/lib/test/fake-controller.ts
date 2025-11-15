import { Controller, Get, Post, Options } from '@nestjs/common'

@Controller('fake')
export class FakeController {
  @Get()
  get() {
    return {}
  }

  @Post()
  post() {
    return {}
  }

  @Options()
  options() {
    return {}
  }
}
