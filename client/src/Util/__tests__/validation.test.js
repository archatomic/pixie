/* eslint-env jest */
const { registerValidator, validate } = require('../validation')

describe('validate', () => {
  it('executes functional validators', () => {
    const mustBeTwenty = v => {
      if (v !== 20) throw new Error('Must be 20')
    }

    // Failed
    const errors = validate(22, mustBeTwenty)
    expect(errors).toBeInstanceOf(Array)
    expect(errors.length).toBe(1)
    expect(errors[0].message).toBe('Must be 20')

    // Successful validation
    expect(validate(20, mustBeTwenty).length).toBe(0)
  })

  it('executes named validators', () => {
    registerValidator('foo', (value) => {
      if (value !== 'foo') throw new Error('That\'s not foo')
    })

    expect(validate('foo', 'foo').length).toBe(0)
    expect(validate('bar', 'foo')[0].message).toBe('That\'s not foo')
  })

  it('executes multiple validators', () => {
    const a = jest.fn()
    const b = jest.fn()
    const c = jest.fn()

    registerValidator('c', c)
    const result = validate('foo', [a, b, 'c'])
    expect(result.length).toBe(0)
    expect(a).toBeCalled()
    expect(b).toBeCalled()
    expect(c).toBeCalled()
  })
})
