import { compose as _c, applyMiddleware, createStore } from 'redux'
import { combineReducers, setInitialState } from 'client/store/combineReducers'

import { PixieFragment } from 'client/model/PixieFragment'
import { State } from 'client/model/State'
import { Tab } from 'client/model/Tab'
import { applicationReducer } from 'client/store/reducers/applicationReducer'
import { promising } from 'client/store/middleware/promising'
import { register } from 'client/util/registry'
import { toolboxReducer } from 'client/store/reducers/toolboxReducer'
import { undoReducer } from 'client/store/reducers/undoReducer'

const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || _c

setInitialState(State.create())

const reducers = {
  application:[
    applicationReducer,
    {
      undoManager: undoReducer,
      toolbox: toolboxReducer
    }
  ],
  fragments: PixieFragment.Collection.createReducer('fragment'),
  tabs: Tab.Collection.createReducer('tab'),
}

/**
 * @type {import('redux').Store<State>}
 */
export const store = createStore(
  combineReducers(reducers),
  compose(applyMiddleware(promising))
)

register('store', store)
