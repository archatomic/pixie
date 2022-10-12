import { action } from 'client/util/action'

export const UNDO_PUSH = 'undo.push'
export const undoPush = (record, description) => action(UNDO_PUSH, { record, description })

export const UNDO = 'undo.undo'
export const undo = (record, steps) => action(UNDO, { record, steps })

export const REDO = 'undo.redo'
export const redo = (record, steps) => action(REDO, { record, steps })
