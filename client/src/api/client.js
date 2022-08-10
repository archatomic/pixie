import { isDefined } from 'client/util/default'
import { join } from 'client/util/url'

class HttpError extends Error {
  /**
   * @param {Response} response
   */
  constructor (response) {
    super(response.statusText)
    this.status = response.status
    this.response = response
  }
}

export class APIClient {
  static _identity
  baseUrl

  constructor (baseUrl) {
    this.baseUrl = baseUrl
  }

  /**
   * Wrapped request call that will reauth and retry if the token has expired.
   *
   * @param {string} method
   * @param {any} path
   * @param {any} options
   *
   * @returns {Promise<any>} Returns the json data
   */
  async request (method, path, options) {
    try {
      return await this._request(method, path, options)
    } catch (e) {
      // Determine if we retry based on the error
      if (!this._shouldRefreshAndRetry(e)) throw e // No? Rethrow.

      await APIClient._identity.refresh()
      return this._request(method, path, options)
    }
  }

  /**
   * Given an error thrown from the request, determine whether or not
   * we should refresh the tokens and try again
   *
   * @param {HttpError} error The error thrown
   *
   * @returns {boolean}
   */
  _shouldRefreshAndRetry (error) {
    // Thrown error did not come from the server
    if (error instanceof HttpError === false) return false

    // Thrown error was not an unauthorized error
    if (error.status !== 401) return false

    // There is no way to refresh the tokens
    if (!APIClient._identity) return false

    // Return true only if we have a refresh token available
    return !!(APIClient._identity.getTokens()?.refresh)
  }

  /**
   * Automatically set up headers and serialize the body, then make the
   * request to the given path.
   *
   * @param {string} method
   * @param {any} path
   * @param {any} options
   *
   * @returns {Promise<any>}
   */
  async _request (method, path, options) {
    const resolved = join(this.baseUrl, path)

    if (isDefined(options.body)) {
      options.body = JSON.stringify(options.body)
    }

    if (!isDefined(options.headers)) {
      options.headers = {}
    }

    options.headers['content-type'] = 'application/json'

    const tokens = APIClient._identity && APIClient._identity.getTokens()
    if (tokens) {
      options.headers.authorization = `Bearer ${tokens.access}`
    }

    const response = await window.fetch(resolved, { ...options, method })

    if (response.status > 399) throw new HttpError(response)

    // Todo: support other types of APIs?
    return response.json()
  }

  /**
   * Perform a GET request
   *
   * @param {any} path
   * @param {any} [options = {}]
   * @returns {Promise<any>}
   */
  async get (path, options = {}) {
    return this.request('GET', path, options)
  }

  /**
   * Perform a POST request, automate the body serialization
   *
   * @param {any} path
   * @param {any} [body = null]
   * @param {any} [options = {}]
   * @returns {Promise<any>}
   */
  async post (path, body = null, options = {}) {
    return this.request('POST', path, { ...options, body })
  }

  /**
   * Perform a PUT request, automate the body serialization
   *
   * @param {any} path
   * @param {any} [body = null]
   * @param {any} [options = {}]
   * @returns {Promise<any>}
   */
  async put (path, body = null, options = {}) {
    return this.request('PUT', path, { ...options, body })
  }

  /**
   * Perform a PATCH request, automate the body serialization
   *
   * @param {any} path
   * @param {any} body
   * @param {any} [options = {}]
   * @returns {Promise<any>}
   */
  async patch (path, body = null, options = {}) {
    return this.request('PATCH', path, { ...options, body })
  }

  /**
   * Perform a DELETE request
   *
   * @param {any} path
   * @param {any} [options = {}]
   * @returns {Promise<any>}
   */
  async delete (path, options = {}) {
    return this.request('DELETE', path, { ...options })
  }
}
