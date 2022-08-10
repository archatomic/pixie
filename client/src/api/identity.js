import { APIClient } from './client'
import { def } from 'client/util/default'
import { storage } from 'client/util/storage'

const TOKEN_STORAGE_KEY = 'ident_tkns'

class Identity extends APIClient {
  _scope = []

  setScope (newScope) {
    this._scope = newScope
  }

  _handlers = []
  on (event, handler) {
    if (event !== 'auth') throw new Error('This event emitter doesn\'t support that yet.')
    this._handlers.push(handler)
  }

  off (event, handler) {
    if (event !== 'auth') throw new Error('This event emitter doesn\'t support that yet.')
    this._handlers = this._handlers.filter(h => h !== handler)
  }

  emit (event, data) {
    if (event !== 'auth') throw new Error('This event emitter doesn\'t support that yet.')
    for (const handler of this._handlers) handler(data)
  }

  getTokens () {
    const tokens = storage.get(TOKEN_STORAGE_KEY)
    this.emit('auth', tokens)
    return tokens
  }

  setTokens (tokens) {
    storage.set(TOKEN_STORAGE_KEY, tokens)
    this.emit('auth', tokens)
  }

  async logout () {
    storage.delete(TOKEN_STORAGE_KEY)
    this.emit('auth', null)
  }

  async login (email, password, scope = this._scope) {
    try {
      const data = await identity.post(
        'token',
        { type: 'password', payload: { email, password, scope } }
      )
      this.setTokens(data.payload)
    } catch (e) {
      if (e.status === 404) throw new Error('These credentials are incorrect')
      if (e.status === 422) throw new Error(e.message)
      throw e
    }
  }

  async refresh () {
    const tokens = this.getTokens()
    if (!tokens) throw new Error('Failed to refresh session. No refresh token.')
    const data = await identity.post(
      'token',
      { type: 'token', payload: { token: tokens.refresh } }
    )
    this.setTokens(data.payload)
  }
}

export const identity = new Identity(def(process.env.IDENTITY_SERVICE_URL, 'http://localhost:8000'))
APIClient._identity = identity
