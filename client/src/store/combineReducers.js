import { Map, isImmutable } from 'immutable'

const get = (object, prop) => {
  if (!object) return undefined
  if (isImmutable(object)) return object.get(prop)
  return object[prop]
}

const set = (object, prop, value) => {
  if (!object) return Map({ [prop]: value })
  if (isImmutable(object)) return object.set(prop, value)
  object[prop] = value // Mutable?? Throw??
  return object
}

const execReducer = (reducer, state, action, global = state) => {
  if (reducer instanceof Function) return reducer(state, action, global)

  else if (reducer instanceof Array) {
    for (const r of reducer) {
      state = execReducer(r, state, action, global)
    }
  } else if (reducer) {
    for (const prop of Object.keys(reducer)) {
      const childState = execReducer(reducer[prop], get(state, prop), action, global)
      state = set(state, prop, childState)
    }
  } else {
    throw new Error('Unexecutable reducer')
  }

  return state
}

export const combineReducers = (...args) => {
  return (state = Map({}), action) => {
    const global = state

    for (const reducer of args) {
      state = execReducer(reducer, state, action, global)
    }

    return state
  }
}
