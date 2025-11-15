import { S3ClientConfig } from '@aws-sdk/client-s3'
import { EnvironmentVariables } from './environment.variables'

export const getStorageConfig = (configEnvs: EnvironmentVariables) => {
  const {
    STORAGE_REGION,
    STORAGE_BUCKET,
    STORAGE_ENDPOINT,
    STORAGE_ACCESS_KEY_ID,
    STORAGE_SECRET_ACCESS_KEY
  } = configEnvs

  const options: S3ClientConfig = {
    forcePathStyle: true,
    region: STORAGE_REGION,
    endpoint: STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: STORAGE_ACCESS_KEY_ID,
      secretAccessKey: STORAGE_SECRET_ACCESS_KEY
    }
  }

  return {
    bucket: STORAGE_BUCKET,
    options
  }
}
