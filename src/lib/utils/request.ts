import { HttpMethods } from '../common'

export const hasBody = (method: string) =>
  [HttpMethods.POST, HttpMethods.PATCH, HttpMethods.PUT].some(
    httpMethod => httpMethod === method
  )
