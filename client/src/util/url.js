import { isDefined } from './default'
import { warn } from './log'

export const join = (...segments) => {
  return segments.map(segment => {
    switch (true) {
      case segment instanceof Array:
        return join(...segment)
      case typeof segment === 'string':
        return segment.replace(/^\/+|\/+$/g, '')
      case !!(segment?.toString):
        return segment.toString()
      case !isDefined(segment):
        warn('Called url.join with undefined segments. This will likely produce a malformed url.')
        return ''
      default:
        return `${segment}`
    }
  }).join('/')
}
