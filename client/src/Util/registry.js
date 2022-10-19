import { def } from './default'

const REGISTRY = {}

export const register = (name, item) =>
{
    REGISTRY[name] = item
}

export const locate = (name, fallback = undefined) =>
{
    return def(REGISTRY[name], fallback)
}
