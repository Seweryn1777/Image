import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf
} from 'class-validator'
import { Environment, NodeEnv } from './constants'
import { Type } from 'class-transformer'
import { toBoolean } from 'lib/utils'

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  readonly NODE_ENV: NodeEnv = NodeEnv.Development

  @IsString()
  readonly ENVIRONMENT: Environment = Environment.Development

  @IsOptional()
  @IsNumber()
  readonly API_PORT: number = 3000

  @IsOptional()
  @IsString()
  readonly API_HOST: string = '0.0.0.0'

  @IsOptional()
  @IsInt()
  readonly THROTTLER_TTL_S: number = 60

  @IsOptional()
  @IsInt()
  readonly THROTTLER_LIMIT: number = 100

  @IsOptional()
  @IsString()
  readonly CORS_ALLOWED_ORIGINS: string = '*'

  // default 20 MB
  @IsOptional()
  @IsInt()
  readonly MAX_FILE_SIZE_KB: number = 20 * 1024 * 1024

  @IsOptional()
  @IsString()
  readonly SERVICE_VERSION: string = 'unknown'

  @IsString()
  readonly TYPEORM_CONNECTION: 'postgres'

  @IsString()
  readonly TYPEORM_HOST: string

  @IsInt()
  @IsPositive()
  readonly TYPEORM_PORT: number

  @IsString()
  readonly TYPEORM_USERNAME: string

  @IsString()
  readonly TYPEORM_PASSWORD: string

  @IsString()
  readonly TYPEORM_DATABASE: string

  @IsOptional()
  @Type(() => String)
  @IsString()
  readonly TYPEORM_SYNCHRONIZE: string = 'false'

  @IsOptional()
  @Type(() => String)
  @IsString()
  readonly TYPEORM_LOGGING: string = 'false'

  @IsOptional()
  @Type(() => String)
  @IsString()
  readonly TYPEORM_DEBUG: string = 'false'

  @IsOptional()
  @IsString()
  readonly REDIS_HOST: string = 'localhost'

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly REDIS_PORT: number = 6379

  @IsOptional()
  @IsString()
  readonly REDIS_PREFIX: string = `${NodeEnv.Development}_`

  @IsOptional()
  @IsString()
  readonly REDIS_USE_TLS: string = 'false'

  @ValidateIf(value => toBoolean(value.USE_SWAGGER))
  @IsString()
  readonly SWAGGER_LOGIN: string

  @ValidateIf(value => toBoolean(value.USE_SWAGGER))
  @IsString()
  readonly SWAGGER_PASSWORD: string

  @IsOptional()
  @ValidateIf(value => toBoolean(value.USE_SWAGGER))
  @IsString()
  readonly SWAGGER_ROUTE: string = '/swagger'

  @IsOptional()
  @Type(() => String)
  @IsString()
  readonly USE_SWAGGER: string = 'false'

  @IsString()
  readonly STORAGE_REGION: string

  @IsString()
  readonly STORAGE_BUCKET: string

  @ValidateIf(value => value.ENVIRONMENT === Environment.Development)
  @IsString()
  readonly STORAGE_ENDPOINT: string

  @ValidateIf(value => value.ENVIRONMENT === Environment.Development)
  @IsString()
  readonly STORAGE_ACCESS_KEY_ID: string

  @ValidateIf(value => value.ENVIRONMENT === Environment.Development)
  @IsString()
  readonly STORAGE_SECRET_ACCESS_KEY: string
}
