export const toBoolean = (value?: unknown) => {
  if (typeof value === 'boolean') {
    return value
  }

  return Boolean(value && (value === 'true' || value === '1'))
}
