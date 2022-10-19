import { compose as _c, applyMiddleware, createStore } from 'redux'
import { combineReducers, setInitialState } from 'Pixie/Store/combineReducers'

import { PixieFragment } from 'Pixie/Model/PixieFragment'
import { State } from 'Pixie/Model/State'
import { Tab } from 'Pixie/Model/Tab'
import { applicationReducer } from 'Pixie/Store/Reducer/applicationReducer'
import { promising } from 'Pixie/Store/Middleware/promising'
import { register } from 'Pixie/util/registry'
import { toolboxReducer } from 'Pixie/Store/Reducer/toolboxReducer'
import { rootReducer } from 'Pixie/Store/Reducer/rootReducer'
import { undoReducer } from 'Pixie/Store/Reducer/undoReducer'
import { PixieLayer } from 'Pixie/Model/PixieLayer'
import { PixieFrame } from 'Pixie/Model/PixieFrame'
import { PixieCel } from 'Pixie/Model/PixieCel'
import { sanitizer } from 'Pixie/Store/sanitizer'
import { playerReducer } from 'Pixie/Store/Reducer/playerReducer'

const compose = getCompose()

function getCompose ()
{
    if (!window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) return _c
    return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(sanitizer)
}

setInitialState(State.create())

const reducers = {
    application: [
        applicationReducer,
        {
            toolbox: toolboxReducer
        }
    ],
    history: undoReducer,
    players: playerReducer,
    tabs: Tab.Collection.createReducer('tab'),
    fragments: PixieFragment.Collection.createReducer('fragment'),
    layers: PixieLayer.Collection.createReducer('layer'),
    frames: PixieFrame.Collection.createReducer('frame'),
    cels: PixieCel.Collection.createReducer('cel'),
}

/**
 * @type {import('redux').Store<State>}
 */
export const store = createStore(
    combineReducers([rootReducer, reducers]),
    compose(applyMiddleware(promising))
)

register('store', store)
