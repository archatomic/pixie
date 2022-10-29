/* eslint-env jest */
const { BinaryReader } = require('../BinaryReader')

describe('BinaryReader', () =>
{
    describe('forward', () =>
    {
        it('steps through the data, bit by bit', () =>
        {
            const reader = new BinaryReader('ab')
            const expectations = [
                { head: 0, bit: 0, value: 1 },
                { head: 0, bit: 1, value: 0 },
                { head: 0, bit: 2, value: 0 },
                { head: 0, bit: 3, value: 0 },
                { head: 0, bit: 4, value: 0 },
                { head: 0, bit: 5, value: 1 },
                { head: 0, bit: 6, value: 1 },
                { head: 0, bit: 7, value: 0 },
                { head: 0, bit: 8, value: 0 },
                { head: 0, bit: 9, value: 0 },
                { head: 0, bit: 10, value: 0 },
                { head: 0, bit: 11, value: 0 },
                { head: 0, bit: 12, value: 0 },
                { head: 0, bit: 13, value: 0 },
                { head: 0, bit: 14, value: 0 },
                { head: 0, bit: 15, value: 0 },
                { head: 1, bit: 0, value: 0 },
                { head: 1, bit: 1, value: 1 },
                { head: 1, bit: 2, value: 0 },
                { head: 1, bit: 3, value: 0 },
                { head: 1, bit: 4, value: 0 },
                { head: 1, bit: 5, value: 1 },
                { head: 1, bit: 6, value: 1 },
                { head: 1, bit: 7, value: 0 },
                { head: 1, bit: 8, value: 0 },
                { head: 1, bit: 9, value: 0 },
                { head: 1, bit: 10, value: 0 },
                { head: 1, bit: 11, value: 0 },
                { head: 1, bit: 12, value: 0 },
                { head: 1, bit: 13, value: 0 },
                { head: 1, bit: 14, value: 0 },
                { head: 1, bit: 15, value: 0 },
            ]

            // 16 bits per character. Verify we pass through all of them
            for (const expected of expectations) {
                reader.forward()
                expect(reader.head).toBe(expected.head)
                expect(reader.bit).toBe(expected.bit)
                expect(reader.value).toBe(expected.value)
            }

            expect(() => reader.forward()).toThrow("Attempted to read past the end of the data.")
        })
    })

    describe('readBit()', () =>
    {
        it('retrieves and returns the next bit', () =>
        {
            const reader = new BinaryReader('ab')
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
                expect(reader.readBit()).toBe(expected)
            }
        })
    })

    describe('readInt()', () =>
    {
        it('retrieves and returns the next int', () =>
        {
            const reader = new BinaryReader('ab')
            const tests = [
                { bits: 2, expected: 1 },
                { bits: 2, expected: 0 },
                { bits: 3, expected: 6 },
                { bits: 8, expected: 0 },
                { bits: 4, expected: 4 },
                { bits: 4, expected: 12 }
            ]

            for (const test of tests) {
                expect(reader.readInt(test.bits)).toBe(test.expected)
            }
        })
    })

    describe('readUTF16()', () =>
    {
        it('retrieves and returns the next section as string', () =>
        {
            const reader = new BinaryReader('abcdefg')

            const tests = [
                { length: 1, expected: 'a' },
                { length: 2, expected: 'bc' }
            ]

            for (const test of tests) {
                expect(reader.readUTF16(test.length)).toBe(test.expected)
            }
        })
    })
})
