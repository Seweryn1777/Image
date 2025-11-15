import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService
} from '@nestjs/terminus'
import { SkipThrottle } from '@nestjs/throttler'
import { getConfig } from 'lib/config'
import { Public } from 'lib/decorators'
import { HEALTH_CHECK } from './constants'

@Controller(HEALTH_CHECK)
export class HealthCheckController {
  private readonly build: string = getConfig().healthCheckConfig.build

  constructor(private health: HealthCheckService) {}

  @Get()
  @SkipThrottle()
  @Public()
  @HealthCheck()
  healthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      () => ({
        app: {
          status: 'up',
          build: this.build
        }
      })
    ])
  }
}
