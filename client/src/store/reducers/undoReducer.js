import {
    REDO,
    UNDO,
    UNDO_PUSH
} from 'client/store/actions/undoActions'

import { UndoManager } from 'client/model/UndoStack'

/** @type {UndoManager} */
const INITIAL_STATE = UndoManager.create()

export const undoReducer = (undoManager = INITIAL_STATE, action = {}, globalState = null) =>
{
    switch (action.type) {
        case UNDO_PUSH:
            return undoManager.push(action.payload.record, action.payload.description)
        case UNDO:
            return undoManager.undo(action.payload.record, action.payload.steps)
        case REDO:
            return undoManager.redo(action.payload.record, action.payload.steps)
    }

    return undoManager
}