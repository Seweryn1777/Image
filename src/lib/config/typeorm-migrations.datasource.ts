import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import * as Entities from '../entities'
import * as Migrations from 'migrations'
import { TimeIntervalMs } from './constants'

config()

const configService = new ConfigService()
// this datasource is needed to generate migrations - it's not used in application itself
export default new DataSource({
  type: 'postgres',
  host: configService.get('TYPEORM_HOST'),
  port: configService.get('TYPEORM_PORT'),
  username: configService.get('TYPEORM_USERNAME'),
  password: configService.get('TYPEORM_PASSWORD'),
  database: configService.get('TYPEORM_DATABASE'),
  entities: Object.values(Entities),
  migrations: Object.values(Migrations),
  maxQueryExecutionTime: TimeIntervalMs.Minute * 30
})
