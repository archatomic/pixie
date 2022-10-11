const { isImmutable } = require("immutable")
const { isPlainObject } = require("./isPlainObject")

/**
 * Recursively loop through a data structure and convert to something simple
 *
 * @param {*} value
 *
 * @returns
 */
export function toData(value) {
    if (!value || typeof value !== 'object') return value
  
    if (value.toData instanceof Function && !value.__callingToData) return value.toData()
    if (isImmutable(value)) value = value.toJSON()
    if (Array.isArray(value)) return value.map(toData)
    if (isPlainObject(value)) {
        const data = {}
        for (const key of Object.keys(value)) {
            if (key[0] === '_' && key !== '_id') continue
            data[key] = toData(value[key])
        }
        return data
    }
  
    return value
  }