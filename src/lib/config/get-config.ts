import { plainToInstance } from 'class-transformer'
import { EnvironmentVariables } from './environment.variables'
import { bodyParserConfig } from './body-parser.config'
import { expressConfig } from './express.config'
import { throttlerConfig } from './throttler.config'
import { validationPipeConfig } from './validation-pipe.config'
import { corsConfig } from './cors.config'
import { healthCheckConfig } from './health-check.config'
import { typeORMConfig } from './typeorm.config'
import { redisConfig } from './redis.config'
import { swaggerConfig } from './swagger.config'
import { getStorageConfig } from './storage.config'
import { uploadConfig } from './upload.config'

export const getConfig = () => {
  const configEnvs = plainToInstance(EnvironmentVariables, process.env, {
    enableImplicitConversion: true
  })

  return {
    bodyParserConfig: bodyParserConfig(configEnvs),
    expressConfig: expressConfig(configEnvs),
    throttlerConfig: throttlerConfig(configEnvs),
    validationPipeConfig: validationPipeConfig(),
    corsConfig: corsConfig(configEnvs),
    healthCheckConfig: healthCheckConfig(configEnvs),
    typeORMConfig: typeORMConfig(configEnvs),
    redisConfig: redisConfig(configEnvs),
    swaggerConfig: swaggerConfig(configEnvs),
    storageConfig: getStorageConfig(configEnvs),
    uploadConfig: uploadConfig(configEnvs)
  }
}
