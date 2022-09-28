const FALLBACK = undefined

/**
 * Return the first defined argument.
 *
 * @param  {...any} values
 * @returns {any}
 */
export function def (...values) {
  for (const value of values) {
    if (isDefined(value)) return value
  }
  return FALLBACK
}

/**
 * Default an objects properties.
 *
 * @param  {...any} values
 * @returns {any}
 */
export function defAll (...values) {
  const op = {}
  for (const value of values) {
    if (!isDefined(value)) continue
    for (const key of Object.keys(value)) {
      if (isDefined(op[key])) continue
      op[key] = value[key]
    }
  }
  return op
}

/**
 * Check whether or not this value is defined and not-null
 *
 * @param {any} val
 * @param {boolean} [nullDefined = false]
 * @returns {boolean}
 */
 export const isDefined = (val, nullDefined = false) => {
  if (val === undefined) return false
  if (val === null) return nullDefined
  if (val && val.null) return nullDefined
  return true
}

/**
 * Check whether or not a value is 'empty'
 *
 * @param {any} value
 * @returns {boolean}
 */
export function isEmpty (value) {
  if (value === null) return true
  if (value === undefined) return true
  if (value === 0) return true
  if (value === '') return true
  if (value instanceof Array && value.length === 0) return true
  if (value instanceof Object && Object.keys(value).length === 0) return true
  return false
}
