import { locate } from "./registry"

export const action = (type, payload) => {
    const store = locate('store')
    if (!store) return
    return store.dispatch({type, payload})
}