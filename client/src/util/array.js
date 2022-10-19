import { isDefined } from './default'

/**
 * Take an argument of any type and ensure it is an array or is in an
 * array. Useful for component / function signatures that take one or
 * many values.
 *
 * @param {any} value
 * @returns {Array}
 */
export function ensureArray (value)
{
    if (!isDefined(value)) return []
    if (value instanceof Array) return value
    return [value]
}
