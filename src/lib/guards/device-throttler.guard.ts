import { ThrottlerGuard } from '@nestjs/throttler'
import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { HeadersKey, UNKNOWN_DEVICE } from '../config'

@Injectable()
export class DeviceThrottlerGuard extends ThrottlerGuard {
  getTracker(req: Request) {
    const deviceId = req.header(HeadersKey.DeviceId) ?? UNKNOWN_DEVICE

    return Promise.resolve(deviceId)
  }
}
