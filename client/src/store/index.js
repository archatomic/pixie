import { compose as _c, applyMiddleware, createStore } from 'redux'
import { combineReducers, setInitialState } from 'client/store/combineReducers'

import { PixieFragment } from 'client/model/PixieFragment'
import { State } from 'client/model/State'
import { Tab } from 'client/model/Tab'
import { applicationReducer } from 'client/store/reducers/applicationReducer'
import { promising } from 'client/store/middleware/promising'
import { register } from 'client/util/registry'
import { toolboxReducer } from 'client/store/reducers/toolboxReducer'
import { rootReducer } from 'client/store/reducers/rootReducer'
import { undoReducer } from 'client/store/reducers/undoReducer'
import { PixieLayer } from 'client/model/PixieLayer'
import { PixieFrame } from 'client/model/PixieFrame'
import { PixieCel } from 'client/model/PixieCel'
import { actionSanitizer, stateSanitizer } from 'client/store/sanitizer'
import { playerReducer } from 'client/store/reducers/playerReducer'

const compose = getCompose()

function getCompose ()
{
  if (!window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) return _c
  return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ actionSanitizer, stateSanitizer })
}

setInitialState(State.create())

const reducers = {
  application:[
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
