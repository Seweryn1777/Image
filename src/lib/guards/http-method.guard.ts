import {
  CanActivate,
  ExecutionContext,
  MethodNotAllowedException
} from '@nestjs/common'
import { Request } from 'express'
import { HttpMethods } from '../common'

export class HttpMethodGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const whitelistedHttpMethods = [
      HttpMethods.GET,
      HttpMethods.POST,
      HttpMethods.PATCH,
      HttpMethods.PUT,
      HttpMethods.DELETE
    ]

    const hasValidHttpMethod = whitelistedHttpMethods.some(
      httpMethod => httpMethod === request.method
    )

    if (!hasValidHttpMethod) {
      throw new MethodNotAllowedException()
    }

    return true
  }
}
