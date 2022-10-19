/* eslint-env jest */
const { isDefined, isEmpty, def, defAll } = require('../default')

describe('isDefined()', () => {
  it('returns false on undefined', () => {
    expect(isDefined(undefined)).toBe(false)
  })

  it('returns false on null', () => {
    expect(isDefined(null)).toBe(false)
  })

  it('returns true on anything non-null and defined', () => {
    const defined = [0, 1, true, '', [], {}, NaN, 'undefined', 'null']
    for (const value of defined) {
      expect(isDefined(value)).toBe(true)
    }
  })
})

describe('isEmpty()', () => {
  it('returns true for empty arrays, objects, and empty values', () => {
    expect(isEmpty(0)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
  })

  it('returns false for non-empty arrays, objects, and values', () => {
    expect(isEmpty(1)).toBe(false)
    expect(isEmpty('hello')).toBe(false)
    expect(isEmpty([true])).toBe(false)
    expect(isEmpty({ foo: 'bar' })).toBe(false)
  })
})

describe('def()', () => {
  it('returns the first defined value in its args', () => {
    expect(def(null, undefined, null, 2, 51)).toBe(2)
    expect(def(undefined, 51)).toBe(51)
    expect(def(false, null)).toBe(false)
  })

  it('returns undefined if nothing in its list is defined', () => {
    expect(def(undefined, undefined)).toBe(undefined)
  })
})

describe('defAll()', () => {
  it('allows for creating default configs', () => {
    const defaults = {
      baz: 'bing',
      fizz: ['bang']
    }
    expect(defAll(null, defaults)).toMatchObject({ baz: 'bing', fizz: ['bang'] })
    expect(defAll({ foo: 'bar' }, defaults)).toMatchObject({ foo: 'bar', baz: 'bing', fizz: ['bang'] })
    expect(defAll({ baz: 'bop', a: null }, defaults)).toMatchObject({ a: null, baz: 'bop', fizz: ['bang'] })
  })
})
