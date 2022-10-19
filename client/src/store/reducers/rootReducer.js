import { REPLACE_STATE } from 'Pixie/store/actions/rootActions'

import { State } from 'Pixie/model/State'

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