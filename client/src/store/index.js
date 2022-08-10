import { compose as _c, applyMiddleware, createStore } from 'redux'

import { combineReducers } from 'client/store/combineReducers'
import { promising } from 'client/store/middleware/promising'
import { register } from 'client/util/registry'

const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || _c

const reducers = {

}

export const store = createStore(
  combineReducers(reducers),
  compose(applyMiddleware(promising))
)

register('store', store)
