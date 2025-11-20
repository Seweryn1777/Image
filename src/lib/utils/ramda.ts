/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  values,
  toPairs,
  fromPairs,
  isNil,
  last,
  is,
  uniq,
  isEmpty,
  complement
} from 'ramda'

const hasKeys = (subject: any) =>
  typeof subject === 'object' ? Object.keys(subject).length > 0 : false
const isDefined = complement(isNil)
const clearObject = <T = any>(subject: Record<string | number, T>) => {
  const filteredArray = toPairs<any>(subject).filter(
    ([, value]) => isDefined(value) && value !== ''
  )

  return fromPairs(filteredArray) as Record<string, T>
}
const hasElements = (subject: any) =>
  Array.isArray(subject) ? subject.length > 0 : false

export {
  last,
  clearObject,
  hasKeys,
  values,
  hasElements,
  is,
  uniq,
  isEmpty,
  isDefined
}
