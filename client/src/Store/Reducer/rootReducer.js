import { REPLACE_STATE } from 'Pixie/Store/Action/rootActions'

import { State } from 'Pixie/Model/State'

/** @type {State} */
const INITIAL_STATE = State.create()

export const rootReducer = (state = INITIAL_STATE, action = {}, globalState = null) =>
{
    switch (action.type) {
        case REPLACE_STATE:
            return action.payload
    }

    return state
}
