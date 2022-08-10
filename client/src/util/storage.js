import { error, warn } from './log'

const fallback = {
  _data: {},
  getItem: key => fallback._data[key],
  setItem: (key, v) => { fallback._data[key] = v },
  removeItem: (key) => { delete fallback._data[key] },
  clear: () => { fallback._data = {} },
  length: 0,
  key: () => ''
}

class Storage {
  _store = window.localStorage

  _tryWithFallback (method, ...args) {
    try {
      return this._store[method](...args)
    } catch (e) {
      if (this._store === fallback) throw e
      warn(`Failed to call ${method} on localStorage. Using memory fallback instead.`, e)
      this._store = fallback
      this._store[method](...args)
    }
  }

  get (key) {
    try {
      return JSON.parse(this._tryWithFallback('getItem', key))
    } catch (e) {
      error(e)
      this.delete(key)
    }
  }

  set (key, value) {
    value = JSON.stringify(value)
    return this._tryWithFallback('setItem', key, value)
  }

  delete (key) {
    return this._tryWithFallback('removeItem', key)
  }

  clear () {
    return this._tryWithFallback('clear')
  }
}

export const storage = new Storage()
