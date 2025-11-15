import { hasKeys, clearObject } from './ramda'

describe('ramda utils', () => {
  describe('hasKeys', () => {
    it('should return false', () => {
      const arg1 = 1
      const arg2 = 'test'
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const arg3 = []
      const arg4 = {}

      expect(hasKeys(arg1)).toBeFalsy()
      expect(hasKeys(arg2)).toBeFalsy()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(hasKeys(arg3)).toBeFalsy()
      expect(hasKeys(arg4)).toBeFalsy()
    })

    it('should return true', () => {
      const arg1 = {
        a: 1
      }

      expect(hasKeys(arg1)).toBeTruthy()
    })
  })

  describe('clearObject', () => {
    it('should return the same object', () => {
      const arg1 = {
        a: 1,
        b: 2,
        c: 3
      }

      expect(clearObject(arg1)).toEqual(arg1)
    })

    it('should return object without undefined value', () => {
      const arg1 = {
        a: 1,
        b: 2,
        c: undefined
      }
      const expectedValue = {
        a: 1,
        b: 2
      }

      expect(clearObject(arg1)).toEqual(expectedValue)
    })

    it('should return object without null value', () => {
      const arg1 = {
        a: 1,
        b: 2,
        c: null
      }
      const expectedValue = {
        a: 1,
        b: 2
      }

      expect(clearObject(arg1)).toEqual(expectedValue)
    })

    it('should return empty object', () => {
      const arg1 = {}

      expect(clearObject(arg1)).toEqual(arg1)
    })

    it('should clear empty string', () => {
      const arg1 = {
        str1: '',
        str2: 'Test'
      }

      expect(clearObject(arg1)).toEqual({
        str2: 'Test'
      })
    })

    it('should not clear zeros', () => {
      const arg1 = {
        str1: 1,
        str2: 0
      }

      expect(clearObject(arg1)).toEqual(arg1)
    })
  })
})
