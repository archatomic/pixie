jest.useFakeTimers()

import { Device } from '../Device'

describe('Device', () =>
{
    const pen = new Device('pen')

    describe('creating inputs', () =>
    {
        it('allows you to describe your devices inputs', () =>
        {
            pen.createButton('tip')
            pen.createButton('eraser')
            pen.createAnalog('pressure')
            pen.createAnalog('x')
            pen.createAnalog('y')
        })
    })

    describe('buttons', () =>
    {
        it('has a boolean value', () =>
        {
            // Defaults to false
            expect(pen.tip === false).toBe(true)
        })

        it('allows you to set the value of the button', () =>
        {
            pen.tip = true
            expect(pen.tip).toBe(true)

            // internals testing
            expect(pen.state.tip.value).toBe(true)

            pen.tip = false
            expect(pen.tip).toBe(false)

            // internals testing
            expect(pen.state.tip.value).toBe(false)
        })

        it('Lets you subscribe to changes', () =>
        {
            const fn = jest.fn()
            const unsubscribe = pen.listen('pen.tip.change', fn)

            // Will trigger
            pen.tip = true

            expect(fn.mock.calls.length).toBe(1)
            expect(fn.mock.calls[0][0]).toMatchObject({
                device: 'pen',
                input: 'tip',
                type: 'change',
                value: true,
                previous: false
            })

            pen.tip = false

            expect(fn.mock.calls.length).toBe(2)
            expect(fn.mock.calls[1][0]).toMatchObject({
                device: 'pen',
                input: 'tip',
                type: 'change',
                value: false,
                previous: true
            })

            pen.tip = false // does not trigger
            expect(fn.mock.calls.length).toBe(2)
            unsubscribe()
        })

        it('supports down and up events', () =>
        {
            const down = jest.fn()
            const unsub1 = pen.listen('pen.tip.down', down)

            const up = jest.fn()
            const unsub2 = pen.listen('pen.tip.up', up)

            pen.tip = true
            expect(down.mock.calls.length).toBe(1)
            expect(up.mock.calls.length).toBe(0)
            expect(down.mock.calls[0][0]).toMatchObject({
                device: 'pen',
                input: 'tip',
                type: 'down'
            })

            pen.tip = false
            expect(down.mock.calls.length).toBe(1)
            expect(up.mock.calls.length).toBe(1)
            expect(up.mock.calls[0][0]).toMatchObject({
                device: 'pen',
                input: 'tip',
                type: 'up'
            })

            unsub1()
            unsub2()
        })
        
        it('supports hold and press events', () =>
        {
            const timeout = 10
            // Make sure we have a predictable timeout
            pen.getButton('tip').holdTimeout = timeout

            const hold = jest.fn()
            const unsub1 = pen.listen('pen.tip.hold', hold)

            const press = jest.fn()
            const unsub2 = pen.listen('pen.tip.press', press)

            pen.tip = true
            // triggers neither event
            expect(hold.mock.calls.length).toBe(0)
            expect(press.mock.calls.length).toBe(0)

            jest.advanceTimersByTime(timeout / 2)
            pen.tip = false
            // triggers press event
            expect(hold.mock.calls.length).toBe(0)
            expect(press.mock.calls.length).toBe(1)

            jest.advanceTimersByTime(timeout * 2)
            // triggers neither event
            expect(hold.mock.calls.length).toBe(0)
            expect(press.mock.calls.length).toBe(1)

            pen.tip = true
            // triggers neither event
            expect(hold.mock.calls.length).toBe(0)
            expect(press.mock.calls.length).toBe(1)

            jest.advanceTimersByTime(timeout * 2)
            // triggers hold event
            expect(hold.mock.calls.length).toBe(1)
            expect(press.mock.calls.length).toBe(1)

            pen.tip = false
            // triggers neither event
            expect(hold.mock.calls.length).toBe(1)
            expect(press.mock.calls.length).toBe(1)

            // Assert call shape
            expect(hold.mock.calls[0][0]).toMatchObject({
                device: 'pen',
                input: 'tip',
                type: 'hold'
            })

            expect(press.mock.calls[0][0]).toMatchObject({
                device: 'pen',
                input: 'tip',
                type: 'press'
            })

            unsub1()
            unsub2()
        })

        it('ignores invalid inputs', () =>
        {
            pen.tip = 'truthy' // invalid
            expect(pen.tip === false).toBe(true)

            pen.tip = 1 // invalid
            expect(pen.tip === false).toBe(true)

            pen.tip = true // valid
            expect(pen.tip === true).toBe(true)

            pen.tip = 0 // invalid
            expect(pen.tip === true).toBe(true)

            pen.tip = null // invalid
            expect(pen.tip === true).toBe(true)

            pen.tip = 0 // invalid
            expect(pen.tip === true).toBe(true)

            pen.tip = false // valid
            expect(pen.tip === false).toBe(true)
        })
    })

    describe('analogs', () =>
    {
        it('defaults to 0', () =>
        {
            expect(pen.pressure).toBe(0)
        })
                    
        it('allows for setting analogs to numbers', () =>
        {
            pen.pressure = 1
            expect(pen.pressure).toBe(1)
        })
                    
        it('ignores nonumeric values', () =>
        {
            pen.pressure = null
            expect(pen.pressure).toBe(1)

            pen.pressure = true
            expect(pen.pressure).toBe(1)

            pen.pressure = '222'
            expect(pen.pressure).toBe(1)
        })
                    
        it('allows for pub/sub to the change event', () =>
        {
            const change = jest.fn()
            const unsubscribe = pen.listen('pen.pressure.change', change)

            pen.pressure = 0.5
            expect(change.mock.calls.length).toBe(1)

            pen.pressure = 0.1
            expect(change.mock.calls.length).toBe(2)

            pen.pressure = 0.1
            expect(change.mock.calls.length).toBe(2)

            pen.pressure = 1
            expect(change.mock.calls.length).toBe(3)

            pen.pressure = null
            expect(change.mock.calls.length).toBe(3)

            expect(change.mock.calls).toMatchObject([
                [{
                    device: 'pen',
                    input: 'pressure',
                    type: 'change',
                    value: 0.5,
                    previous: 1
                }],
                [{
                    device: 'pen',
                    input: 'pressure',
                    type: 'change',
                    value: 0.1,
                    previous: 0.5
                }],
                [{
                    device: 'pen',
                    input: 'pressure',
                    type: 'change',
                    value: 1,
                    previous: 0.1
                }]
            ])
            
            unsubscribe()
        })
    })

    describe('getState', () =>
    {
        it('returns a shallow copy of the device state', () =>
        {
            expect(pen.getState()).toMatchObject({
                tip: false,
                eraser: false,
                pressure: 1,
                x: 0,
                y: 0
            })
        })
    })
})