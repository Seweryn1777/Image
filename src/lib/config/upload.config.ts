import { EnvironmentVariables } from './environment.variables'

export const uploadConfig = (configEnvs: EnvironmentVariables) => ({
  filesize: configEnvs.MAX_FILE_SIZE_KB
})
