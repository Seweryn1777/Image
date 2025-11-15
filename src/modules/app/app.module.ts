import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import Redis from 'ioredis'
import { envValidation, getConfig } from 'lib/config'
import { DeviceIdGuard, DeviceThrottlerGuard } from 'lib/guards'
import { HealthCheckModule } from 'modules/health-check'
import { ImageModule } from 'modules/image'
import { StorageModule } from 'modules/storage'
import { AppService } from './app.service'

@Module({
  imports: [
    HealthCheckModule,
    ImageModule,
    StorageModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true
      }
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getConfig().typeORMConfig
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ...getConfig().throttlerConfig }],
      storage: new ThrottlerStorageRedisService(
        new Redis(getConfig().redisConfig)
      )
    })
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: DeviceIdGuard
    },
    {
      provide: APP_GUARD,
      useClass: DeviceThrottlerGuard
    }
  ]
})
export class AppModule {}
