import { locate } from "./registry"

export const action = (type, payload) => {
    const store = locate('store')
    if (!store) return
    return store.dispatch({type, payload})
}

export const collectionActions = (name) =>
{
    return {
        save : record => action(`${name}.save`, record),
        delete : record => action(`${name}.delete`, record),
        sort : payload => action(`${name}.sort`, payload),
    }
}