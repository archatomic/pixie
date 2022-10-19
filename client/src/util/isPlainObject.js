/**
 * @see https://github.com/immutable-js/immutable-js/blob/main/src/utils/isPlainObj.js
 * @param {*} value
 * @returns {*}
 */
export function isPlainObject (value)
{
    // The base prototype's toString deals with Argument objects and native namespaces like Math
    if (
        !value ||
        typeof value !== 'object' ||
        toString.call(value) !== '[object Object]'
    ) {
        return false
    }

    const proto = Object.getPrototypeOf(value)
    if (proto === null) {
        return true
    }

    // Iteratively going up the prototype chain is needed for cross-realm environments (differing contexts, iframes, etc)
    let parentProto = proto
    let nextProto = Object.getPrototypeOf(proto)
    while (nextProto !== null) {
        parentProto = nextProto
        nextProto = Object.getPrototypeOf(parentProto)
    }
    return parentProto === proto
}
