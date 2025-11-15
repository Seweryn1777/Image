import { toBoolean } from '../utils'
import { EnvironmentVariables } from './environment.variables'

export const redisConfig = (configEnvs: EnvironmentVariables) => ({
  port: configEnvs.REDIS_PORT,
  host: configEnvs.REDIS_HOST,
  useTls: toBoolean(configEnvs.REDIS_USE_TLS)
})
