export enum TimeIntervalMs {
  Second = 1000,
  Minute = TimeIntervalMs.Second * 60,
  Hour = TimeIntervalMs.Minute * 60,
  Day = TimeIntervalMs.Hour * 24
}

export enum HeadersKey {
  ApiKey = 'api-key',
  Authorization = 'authorization',
  DeviceId = 'device-id'
}

export enum NodeEnv {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test'
}

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
  Local = 'local'
}

export const UNKNOWN_DEVICE = 'unknown'
