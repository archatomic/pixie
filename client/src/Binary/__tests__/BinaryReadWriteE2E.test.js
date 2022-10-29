/* eslint-env jest */
const { BinaryWriter } = require('../BinaryWriter')
const { BinaryReader } = require('../BinaryReader')

describe('binary reader / writer interop', () =>
{
    it('deserializes the same values that get serialized', () =>
    {
        const writer = new BinaryWriter()
        writer.writeBool(true)
        writer.writeInt(37, 12)
        writer.writeUTF16('i am utf16')
        writer.writeInt(21, 5)
        writer.writeASCII('i am ascii', 35)
        writer.writeBit(1)

        const reader = new BinaryReader(writer.data)
        expect(reader.readBool()).toBe(true)
        expect(reader.readInt(12)).toBe(37)
        expect(reader.readUTF16(10)).toBe('i am utf16')
        expect(reader.readInt(5)).toBe(21)
        expect(reader.readASCII(35)).toBe('i am ascii')
        expect(reader.readBit()).toBe(1)
    })
})
