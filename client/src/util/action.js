import { UNDO_PUSH } from 'client/store/actions/undoActions'
import { locate } from "./registry"
import { warn } from 'client/util/log'

export const action = (type, payload) => {
    const store = locate('store')
    if (!store) return warn(`Tried to call an action before the store was registered: ${type}`)
    return store.dispatch({type, payload})
}

const getDescriptions = maybe => typeof maybe === 'string' ? maybe : undefined

export const collectionActions = (name) =>
{
    return {
        save: (record, opts = {}) =>
        {
            action(`${name}.save`, record)
            if (opts.history) action(
                UNDO_PUSH,
                {
                    record,
                    description: getDescriptions(opts.history)
                }
            )
        },
        delete : record => action(`${name}.delete`, record),
        sort : payload => action(`${name}.sort`, payload),
    }
}