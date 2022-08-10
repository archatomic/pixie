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
  return null
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
 * @param {any} value
 * @returns {boolean}
 */
export function isDefined (value) {
  return (value !== null && value !== undefined)
}

/**
 * Check whether or not a value is 'empty'
 *
 * @param {any} value
 * @returns {boolean}
 */
export function isEmpty (value) {
  return value === null ||
  value === undefined ||
  value === 0 ||
  value === '' ||
  (value instanceof Array && value.length === 0) ||
  (value instanceof Object && Object.keys(value).length === 0)
}
