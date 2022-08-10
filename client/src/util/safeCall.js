export const safeCall = (fn, ...args) => {
    if (fn) return fn(...args)
}

export const safeCallIgnore = (fn, ...args) => {
    try {
        return safeCall(fn, ...args)
    } catch (e) {
        console.error(e)
    }
}

export const makeSafe = (fn) => (...args) => safeCallIgnore(fn, ...args)