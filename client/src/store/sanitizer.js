export const actionSanitizer = (action) =>
{
    // Capture records with a sanitize method on them
    if (action.payload?.sanitize instanceof Function) {
        return {
            ...action,
            payload: action.payload.sanitize()
        }
    }

    if (action.type === 'undo.push') {
        // swipe out cels on undo actions
        return {
                ...action,
                payload: {
                ...action.payload,
                record: {
                    ...action.payload.record,
                    cels: '<CEL ARRAY>'
                }
            }
        }
    }

    return action
}

export const stateSanitizer = state => state.sanitize()
