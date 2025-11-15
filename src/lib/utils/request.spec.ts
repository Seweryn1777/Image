import * as requestUtils from './request'
import { HttpMethods } from '../common'

describe('utils: request', () => {
  describe('hasBody', () => {
    it('should return true if given http method supports body', () => {
      const method1 = HttpMethods.POST
      const method2 = HttpMethods.PATCH
      const method3 = HttpMethods.PUT

      expect(requestUtils.hasBody(method1)).toEqual(true)
      expect(requestUtils.hasBody(method2)).toEqual(true)
      expect(requestUtils.hasBody(method3)).toEqual(true)
    })

    it('should return false if given http method doesnt supports body', () => {
      const method1 = HttpMethods.GET
      const method2 = HttpMethods.DELETE

      expect(requestUtils.hasBody(method1)).toEqual(false)
      expect(requestUtils.hasBody(method2)).toEqual(false)
    })
  })
})
