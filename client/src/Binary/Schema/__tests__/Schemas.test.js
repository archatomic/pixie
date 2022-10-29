import '../defs'
import { BinaryData } from 'Pixie/Binary/BinaryData'

describe('Schemas', () =>
{
    describe('bit', () =>
    {
        const data = new BinaryData()

        it('can pack bits', () =>
        {
            data.writeBit(1)
            data.writeBit(0)
            data.writeBit(0)
            data.writeBit(1)
        })

        it('can read bits', () =>
        {
            expect(data.readBit()).toBe(1)
            expect(data.readBit()).toBe(0)
            expect(data.readBit()).toBe(0)
            expect(data.readBit()).toBe(1)
        })
    })

    describe('int', () =>
    {
        const data = new BinaryData()

        it('can pack ints', () =>
        {
            data.writeInt(1)
            data.writeInt(2, 7)
            data.writeInt(3, 12)
            data.writeInt(4, 64)
        })

        it('can read ints', () =>
        {
            expect(data.readInt()).toBe(1)
            expect(data.readInt(7)).toBe(2)
            expect(data.readInt(12)).toBe(3)
            expect(data.readInt(64)).toBe(4)
        })
    })

    describe('bool', () =>
    {
        const data = new BinaryData()

        it('can pack bools', () =>
        {
            data.writeBool(true)
            data.writeBool(false)
            data.writeBool(false)
            data.writeBool(true)
            data.writeBool(false)
        })

        it('can read bools', () =>
        {
            expect(data.readBool()).toBe(true)
            expect(data.readBool()).toBe(false)
            expect(data.readBool()).toBe(false)
            expect(data.readBool()).toBe(true)
            expect(data.readBool()).toBe(false)
        })
    })

    describe('string', () =>
    {
        const data = new BinaryData()

        it('can pack strings', () =>
        {
            data.writeString('Hello World', 32)
            data.writeString('goodbye moon', 16)
            data.writeString('Whaaaaat', 10, 7)
        })

        it('can read strings', () =>
        {
            expect(data.readString(32)).toBe('Hello World')
            expect(data.readString(16)).toBe('goodbye moon')
            expect(data.readString(10, 7)).toBe('Whaaaaat')
        })
    })

    describe('float', () =>
    {
        const data = new BinaryData()

        it('can pack floats', () =>
        {
            data.writeFloat(8 / 3)
            data.writeFloat(0.25)
            data.writeFloat(Math.PI)
        })

        it('can read floats', () =>
        {
            expect(data.readFloat()).toBe(8 / 3)
            expect(data.readFloat()).toBe(0.25)
            expect(data.readFloat()).toBe(Math.PI)
        })
    })

    describe('array', () =>
    {
        const data = new BinaryData()

        it('can pack arrays', () =>
        {
            data.writeArray([1, 2, 3, 4], 'int')
            data.writeArray(['a', 'b', 'c', 'd'], 'string', 1, 7)
            data.writeArray([true, false, true], 'bool')
            expect(() => data.writeArray(['ab'], 'string', 1, 7)).toThrow('too few characters')
        })

        it('can read arrays', () =>
        {
            expect(data.readArray('int')).toEqual([1, 2, 3, 4])
            expect(data.readArray('string', 1, 7)).toEqual(['a', 'b', 'c', 'd'])
            expect(data.readArray('bool')).toEqual([true, false, true])
        })
    })

    describe('objects', () =>
    {
        const data = new BinaryData()

        it('can pack objects', () =>
        {
            data.writeObject(
                { foo: 'bar', baz: 20 },
                { foo: 'string', baz: ['int', 8] }
            )
        })

        it('can read objects', () =>
        {
            expect(data.readObject(
                { foo: 'string', baz: ['int', 8] }
            )).toEqual({ foo: 'bar', baz: 20 })
        })
    })
})
