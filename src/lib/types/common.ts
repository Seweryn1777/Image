export type Nullable<T> = T | null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KeyValuePair<T = any> = { [key: string]: T } | { [key: number]: T }
