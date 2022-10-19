let maxSymbol = 0

/**
 * Create an enum of unique values.
 *
 * @template {string} T
 *
 * @param { T[] } values
 * @param { object } opts
 * @param { boolean } [opts.useNames]
 *
 * @returns {Record<T, any>}
 */
export const createEnum = (values, { useNames = false } = {}) =>
{
    const op = {}

    if (useNames) {
        for (const value of values) {
            op[value] = value
        }
    } else {
        for (let i = 0; i < values.length; i++) {
            op[values[i]] = ++maxSymbol
        }
    }

    Object.freeze(op)

    return op
}
