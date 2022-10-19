/* eslint-env jest */
const { FieldData } = require('../FieldData')

describe('FieldData', () => {
  it('lets you traverse complex data', () => {
    const fd = new FieldData({ foo: { bar: ['baz', 'bing', 'bop'] } })
    const baz = fd.get(['foo', 'bar', 0])
    const bing = fd.get(['foo', 'bar', 1])
    const bop = fd.get(['foo', 'bar', 2])

    expect(baz.raw).toBe('baz')
    expect(baz.path).toMatchObject(['foo', 'bar', 0])
    expect(baz.root).toBe(fd)

    expect(bing.raw).toBe('bing')
    expect(bing.path).toMatchObject(['foo', 'bar', 1])
    expect(bing.root).toBe(fd)

    expect(bop.raw).toBe('bop')
    expect(bop.path).toMatchObject(['foo', 'bar', 2])
    expect(bop.root).toBe(fd)

    fd.set(['foo', 'bar', 0], 'newbaz')
    fd.set(['foo', 'bar', 3], 'newmem')

    expect(fd.raw).toMatchObject({ foo: { bar: ['newbaz', 'bing', 'bop', 'newmem'] } })
  })
})
