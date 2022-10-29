import '../defs'
import { BinaryData } from 'Pixie/Binary/BinaryData'
import { SchemaBuilder } from 'Pixie/Binary/Schema/SchemaBuilder'
import { schemaRepository } from 'Pixie/Binary/Schema/SchemaRespository'
import { invariant } from 'Pixie/Util/invariant'

describe('SchemaBuilder', () =>
{
    it('allows you to define a schema', () =>
    {
        SchemaBuilder
            .create('test', 999)
            .validate(value => invariant(
                value === 0 || value === 1,
                'BAD INPUT BIT',
                value
            ))
            .unpack(data => data.read())
            .pack((data, value) => data.write(value))
            .build()
    })

    it('registers that schema with the repository', () =>
    {
        expect(schemaRepository.schemas.test.length).toBe(1)
    })

    it('adds pack and unpack methods to BinaryData', () =>
    {
        const data = new BinaryData()
        expect(() => data.writeTest('fail')).toThrow('BAD INPUT BIT')

        data.writeTest(1)
        data.writeTest(0)
        data.writeTest(0)
        data.writeTest(1)

        expect(data.readTest()).toBe(1)
        expect(data.readTest()).toBe(0)
        expect(data.readTest()).toBe(0)
        expect(data.readTest()).toBe(1)
    })

    it('supports arguments', () =>
    {
        const pack = jest.fn()
        const unpack = jest.fn()

        SchemaBuilder
            .create('arg', 998)
            .argument('foo', 'one')
            .argument('bar', 'two', [v => invariant(v !== 'bad', 'ARG VALIDATION')])
            .unpack(unpack)
            .pack(pack)
            .build()

        const data = new BinaryData()

        data.writeArg('val')
        expect(pack.mock.calls[0]).toEqual([
            data,
            'val',
            'one',
            'two'
        ])

        data.writeArg(0, 'zero', 'blorg')
        expect(pack.mock.calls[1]).toEqual([
            data,
            0,
            'zero',
            'blorg'
        ])

        expect(() => data.writeArg(1, 'zero', 'bad')).toThrow('ARG VALIDATION')

        data.readArg()
        expect(unpack.mock.calls[0]).toEqual([
            data,
            'one',
            'two'
        ])

        data.readArg(1, 2)
        expect(unpack.mock.calls[1]).toEqual([
            data,
            1,
            2
        ])

        expect(() => data.readArg('zero', 'bad')).toThrow('ARG VALIDATION')
    })

    it('allows you to create arrays', () =>
    {
        SchemaBuilder
            .array('TestArray', 999)
            .member('string', 4, 7)
            .build()

        const data = new BinaryData()
        data.writeTestArray(['abcd', 'efgh', 'ijkl'])
        expect(data.readTestArray()).toEqual(['abcd', 'efgh', 'ijkl'])

        expect(() => data.writeTestArray(22)).toThrow('non array')

        // Testing member arguments
        expect(() => data.writeTestArray([22])).toThrow('non string')
        expect(() => data.writeTestArray(['abcde'])).toThrow('too few characters')
    })

    it('allows you to create objects', () =>
    {
        SchemaBuilder
            .object('TestObject', 999)
            .properties({
                foo: ['int', 8],
                bar: 'bool',
                baz: ['string', 10, 7]
            })
            .build()

        const data = new BinaryData()
        data.writeTestObject({ foo: 244, bar: false, baz: 'hey there.' })
        expect(data.readTestObject()).toEqual({ foo: 244, bar: false, baz: 'hey there.' })

        // Testing member validations
        expect(() => data.writeTestObject(22)).toThrow('non object')
        expect(() => data.writeTestObject({ foo: 20000 })).toThrow('Not enough bits')
        expect(() => data.writeTestObject({ foo: 1, bar: 1 })).toThrow('non boolean')
        expect(() => data.writeTestObject({ foo: 1, bar: true, baz: 'this string is too long' })).toThrow('too few characters')
    })
})
