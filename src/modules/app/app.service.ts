import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import {
  COMMAND_NOT_FOUND_MESSAGE,
  LOGGER_CONTEXT,
  SHUTDOWN_MESSAGE
} from './constants'

@Injectable()
export class AppService implements OnApplicationShutdown {
  private readonly logger = new Logger(LOGGER_CONTEXT)

  onApplicationShutdown() {
    this.logger.log(SHUTDOWN_MESSAGE)

    process.exit(0)
  }

  commandNotFound() {
    this.logger.log(COMMAND_NOT_FOUND_MESSAGE)
  }
}
