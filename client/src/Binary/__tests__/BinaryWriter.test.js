/* eslint-env jest */
const { BinaryWriter } = require('../BinaryWriter')

describe('BinaryWriter', () =>
{
    describe('writeBit', () =>
    {
        it('Adds a bit to the data', () =>
        {
            const writer = new BinaryWriter()
            const tests = [
                { write: 1, data: '\x01', bit: 0, value: 1 },
                { write: 0, data: '\x01', bit: 1, value: 1 },
                { write: 0, data: '\x01', bit: 2, value: 1 },
                { write: 0, data: '\x01', bit: 3, value: 1 },
                { write: 0, data: '\x01', bit: 4, value: 1 },
                { write: 1, data: '!', bit: 5, value: 33 },
                { write: 1, data: 'a', bit: 6, value: 97 },
                { write: 0, data: 'a', bit: 7, value: 97 },
                { write: 0, data: 'a', bit: 8, value: 97 },
                { write: 0, data: 'a', bit: 9, value: 97 },
                { write: 0, data: 'a', bit: 10, value: 97 },
                { write: 0, data: 'a', bit: 11, value: 97 },
                { write: 0, data: 'a', bit: 12, value: 97 },
                { write: 0, data: 'a', bit: 13, value: 97 },
                { write: 0, data: 'a', bit: 14, value: 97 },
                { write: 0, data: 'a', bit: -1, value: 0 },
            ]

            // 16 bits per character. Verify we pass through all of them
            for (const { write, data, bit, value } of tests) {
                writer.writeBit(write)
                expect(writer.bit).toBe(bit)
                expect(writer.value).toBe(value)
                expect(writer.data).toBe(data)
            }
        })
    })

    describe('writeUTF16', () =>
    {
        it('writes strings into the data', () =>
        {
            const writer = new BinaryWriter()
            writer.writeUTF16('hello world')
            expect(writer.data).toBe('hello world')
        })
    })
})
