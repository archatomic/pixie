import { compose as _c, applyMiddleware, createStore } from 'redux'
import { combineReducers, setInitialState } from 'Pixie/store/combineReducers'

import { PixieFragment } from 'Pixie/model/PixieFragment'
import { State } from 'Pixie/model/State'
import { Tab } from 'Pixie/model/Tab'
import { applicationReducer } from 'Pixie/store/reducers/applicationReducer'
import { promising } from 'Pixie/store/middleware/promising'
import { register } from 'Pixie/util/registry'
import { toolboxReducer } from 'Pixie/store/reducers/toolboxReducer'
import { rootReducer } from 'Pixie/store/reducers/rootReducer'
import { undoReducer } from 'Pixie/store/reducers/undoReducer'
import { PixieLayer } from 'Pixie/model/PixieLayer'
import { PixieFrame } from 'Pixie/model/PixieFrame'
import { PixieCel } from 'Pixie/model/PixieCel'
import { actionSanitizer, stateSanitizer } from 'Pixie/store/sanitizer'
import { playerReducer } from 'Pixie/store/reducers/playerReducer'

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
