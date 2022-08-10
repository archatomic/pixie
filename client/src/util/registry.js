const registry = {}

export const register = (name, item) => {
    registry[name] = item
}

export const locate = (name) => {
    return registry[name]
}
