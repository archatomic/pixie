import { compose as _c, applyMiddleware, createStore } from 'redux'

import { PixieFragment } from 'client/model/PixieFragment'
import { Tab } from 'client/model/Application'
import { applicationReducer } from 'client/store/reducers/applicationReducer'
import { combineReducers } from 'client/store/combineReducers'
import { promising } from 'client/store/middleware/promising'
import { register } from 'client/util/registry'

const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || _c

const reducers = {
  application: [
    applicationReducer,
    {
      fragments: PixieFragment.Collection.createReducer('fragment'),
      tabs: Tab.Collection.createReducer('tab')
    }
  ],
}

export const store = createStore(
  combineReducers(reducers),
  compose(applyMiddleware(promising))
)

register('store', store)
