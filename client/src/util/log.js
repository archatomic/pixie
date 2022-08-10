import { def } from './default'
import { noop } from './noop'

const LOG_LEVEL = def(process.env.LOG_LEVEL, 'debug')

const levels = {
  silent: 0,
  fatal: 1,
  error: 2,
  warning: 3,
  info: 4,
  debug: 5,
  trace: 6,
  all: 7
}

/**
 * Determine whether or not the log level supports this method once at runtime,
 * and either return the log method, or a noop.
 *
 * @param {string} level
 * @param {string} method
 * @returns {(...any)=>void}
 */
function wrapConsole (level, method = level) {
  if (!isLevel(level)) return noop
  return (...args) => console[method](...args)
}

export function isLevel (level) {
  return levels[level.toLowerCase()] <= levels[LOG_LEVEL.toLowerCase()]
}

export const log = wrapConsole('debug', 'log')
export const trace = wrapConsole('trace')
export const debug = wrapConsole('debug')
export const info = wrapConsole('info')
export const warn = wrapConsole('warning', 'warn')
export const error = wrapConsole('error')
export const fatal = wrapConsole('fatal', 'error')
