import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { HeadersKey } from '../config'
import { DecoratorName } from '../common'

@Injectable()
export class DeviceIdGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isHandlerPublic = this.reflector.get<boolean | undefined>(
      DecoratorName.Public,
      context.getHandler()
    )
    const isControllerPublic = this.reflector.get<boolean | undefined>(
      DecoratorName.Public,
      context.getClass()
    )

    if (isHandlerPublic || isControllerPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const deviceId = request.header(HeadersKey.DeviceId)

    const logger = new Logger('DeviceIdGuard')
    const hasDeviceId = Boolean(deviceId)

    if (!hasDeviceId) {
      logger.error('Device ID is missing')

      return false
    }

    return true
  }
}
