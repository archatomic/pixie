import { compose as _c, applyMiddleware, createStore } from 'redux'

import { PixieFragment } from 'client/model/PixieFragment'
import { Tab } from 'client/model/Tab'
import { applicationReducer } from 'client/store/reducers/applicationReducer'
import { combineReducers } from 'client/store/combineReducers'
import { promising } from 'client/store/middleware/promising'
import { register } from 'client/util/registry'
import { undoReducer } from 'client/store/reducers/undoReducer'
import { toolboxReducer } from 'client/store/reducers/toolboxReducer'

const compose = _c //window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || _c

const reducers = {
  application: [
    applicationReducer,
    {
      undoManager: undoReducer,
      fragments: PixieFragment.Collection.createReducer('fragment'),
      tabs: Tab.Collection.createReducer('tab'),
      toolbox: toolboxReducer
    }
  ],
}

export const store = createStore(
  combineReducers(reducers),
  compose(applyMiddleware(promising))
)

register('store', store)
