/* eslint-env jest */
require('../Schema/defs')
const { BinaryData } = require('../BinaryData')

describe('BinaryData', () =>
{
    describe('read', () =>
    {
        it('steps through the data, bit by bit', () =>
        {
            const data = BinaryData.fromString('ab')
            const expectations = [
                { head: 0, bit: 0, value: 1 },
                { head: 0, bit: 1, value: 0 },
                { head: 0, bit: 2, value: 0 },
                { head: 0, bit: 3, value: 0 },
                { head: 0, bit: 4, value: 0 },
                { head: 0, bit: 5, value: 1 },
                { head: 0, bit: 6, value: 1 },
                { head: 0, bit: 7, value: 0 },
                { head: 1, bit: 0, value: 0 },
                { head: 1, bit: 1, value: 0 },
                { head: 1, bit: 2, value: 0 },
                { head: 1, bit: 3, value: 0 },
                { head: 1, bit: 4, value: 0 },
                { head: 1, bit: 5, value: 0 },
                { head: 1, bit: 6, value: 0 },
                { head: 1, bit: 7, value: 0 },
                { head: 2, bit: 0, value: 0 },
                { head: 2, bit: 1, value: 1 },
                { head: 2, bit: 2, value: 0 },
                { head: 2, bit: 3, value: 0 },
                { head: 2, bit: 4, value: 0 },
                { head: 2, bit: 5, value: 1 },
                { head: 2, bit: 6, value: 1 },
                { head: 2, bit: 7, value: 0 },
                { head: 3, bit: 0, value: 0 },
                { head: 3, bit: 1, value: 0 },
                { head: 3, bit: 2, value: 0 },
                { head: 3, bit: 3, value: 0 },
                { head: 3, bit: 4, value: 0 },
                { head: 3, bit: 5, value: 0 },
                { head: 3, bit: 6, value: 0 },
                { head: 3, bit: 7, value: 0 },
            ]

            // 16 bits per character. Verify we pass through all of them
            for (const expected of expectations) {
                data.read()
                expect(data._readHead).toBe(expected.head)
                expect(data._readBitAddr).toBe(expected.bit)
                expect(data._readBit).toBe(expected.value)
            }

            expect(() => data.read()).toThrow("Attempted to read past the end of the data.")
        })
    })

    describe('readBit()', () =>
    {
        it('retrieves and returns the next bit', () =>
        {
            const data = BinaryData.fromString('ab')
            const expectations = [
                1,
                0,
                0,
                0,
                0,
                1,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                1,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ]

            for (const expected of expectations) {
                expect(data.readBit()).toBe(expected)
            }
        })
    })

    describe('readInt()', () =>
    {
        it('retrieves and returns the next int', () =>
        {
            const data = BinaryData.fromString('ab')
            const tests = [
                { bits: 2, expected: 1 },
                { bits: 2, expected: 0 },
                { bits: 3, expected: 6 },
                { bits: 8, expected: 0 },
                { bits: 4, expected: 4 },
                { bits: 4, expected: 12 }
            ]

            for (const test of tests) {
                expect(data.readInt(test.bits)).toBe(test.expected)
            }
        })
    })

    describe('readString()', () =>
    {
        it('retrieves and returns the next section as string', () =>
        {
            const data = BinaryData.fromString('abcdefg')

            const tests = [
                { length: 1, expected: 'a' },
                { length: 2, expected: 'bc' }
            ]

            for (const test of tests) {
                expect(data.readString(test.length)).toBe(test.expected)
            }
        })
    })
})
