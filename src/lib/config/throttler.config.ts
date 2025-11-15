import { EnvironmentVariables } from './environment.variables'

export const throttlerConfig = (configEnvs: EnvironmentVariables) => ({
  ttl: configEnvs.THROTTLER_TTL_S,
  limit: configEnvs.THROTTLER_LIMIT
})
