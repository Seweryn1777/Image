import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import * as Migrations from 'migrations'
import * as Entities from '../entities'
import { toBoolean } from '../utils'
import { EnvironmentVariables } from './environment.variables'
import { TimeIntervalMs } from './constants'

export const typeORMConfig = (
  configEnvs: EnvironmentVariables
): TypeOrmModuleOptions => {
  return {
    type: configEnvs.TYPEORM_CONNECTION,
    host: configEnvs.TYPEORM_HOST,
    port: configEnvs.TYPEORM_PORT,
    username: configEnvs.TYPEORM_USERNAME,
    password: configEnvs.TYPEORM_PASSWORD,
    database: configEnvs.TYPEORM_DATABASE,
    entities: Object.values(Entities),
    migrations: Object.values(Migrations),
    migrationsRun: true,
    autoLoadEntities: true,
    logging: toBoolean(configEnvs.TYPEORM_LOGGING),
    synchronize: toBoolean(configEnvs.TYPEORM_SYNCHRONIZE),
    maxQueryExecutionTime: TimeIntervalMs.Minute,
    cache: {
      type: 'ioredis',
      options: {
        host: configEnvs.REDIS_HOST,
        prefix: configEnvs.REDIS_PREFIX,
        port: configEnvs.REDIS_PORT
      }
    }
  }
}
