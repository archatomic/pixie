import { SchemaBuilder } from 'Pixie/Binary/Schema/SchemaBuilder'
import { ensureArray } from 'Pixie/Util/array'
import { isDefined } from 'Pixie/Util/default'
import { invariant } from 'Pixie/Util/invariant'
import { isPlainObject } from 'Pixie/Util/isPlainObject'

export const SCHEMA = {
    BIT: 0,
    INT: 1,
    BOOL: 2,
    STRING: 3,
    FLOAT: 4,
    IMAGE: 5,
    ARRAY: 6,
    OBJECT: 7,
}

export const ENCODING = {
    UTF16: 16,
    ASCII: 7
}

// Bit
SchemaBuilder
    .create('bit', SCHEMA.BIT)
    .validate(value => invariant(
        value === 0 || value === 1,
        'Tried to pack non binary bit',
        value
    ))
    .unpack(data => data.read())
    .pack((data, value) => data.write(value))
    .build()

const shift = (v, i) => v * Math.pow(2, i)

// Integer
// TODO: Instead of writing a single bit at a time, this can be
// optimized by determining how many bits of the number to write,
// by comparing to the remaining bits in the word, then writing
// them a word at a time.
SchemaBuilder
    .create('int', SCHEMA.INT)
    .argument('bits', 8)
    .validate(value => invariant(
        typeof value === 'number',
        'Tried to pack non integer as int',
        value
    ))
    .validate((value, bits) => invariant(
        value < Math.pow(2, bits),
        `Not enough bits to pack the provided integer value: ${value}, ${bits}`,
        {
            value,
            bits
        }
    ))
    .unpack((data, bits) =>
    {
        let op = 0

        if (bits > 31) {
            for (let i = 0; i < bits; i++) {
                op += shift(data.readBit(), i)
            }
        } else {
            for (let i = 0; i < bits; i++) {
                op += data.readBit() << i
            }
        }

        return op
    })
    .pack(
        (data, value, bits) =>
        {
            if (bits > 31) {
                for (let i = 0; i < bits; i++) {
                    data.writeBit(shift(value, -i) & 1)
                }
            } else {
                for (let i = 0; i < bits; i++) {
                    data.writeBit((value >> i) & 1)
                }
            }
        }
    )
    .build()

// Boolean
SchemaBuilder
    .create('bool', SCHEMA.BOOL)
    .validate(value => invariant(
        value === false || value === true,
        'Tried to pack non boolean into a bool field',
        value
    ))
    .unpack(data => data.readBit() === 1)
    .pack((data, value) => data.writeBit(value ? 1 : 0))
    .build()

// String
SchemaBuilder
    .create('string', SCHEMA.STRING)
    .argument('length', 32)
    .argument('bitDepth', ENCODING.UTF16)
    .validate(value => invariant(
        typeof value === 'string',
        'Tried to pack non string into a string field',
        value
    ))
    .validate((value, length) => invariant(
        value.length <= length,
        'Tried to pack a string into too few characters',
        { value, length }
    ))
    .unpack((data, length, bitDepth) =>
    {
        let op = ''
        for (let i = 0; i < length; i++) {
            const charCode = data.readInt(bitDepth)
            if (charCode === 0) continue // Skip null bytes
            op += String.fromCharCode(charCode)
        }
        return op
    })
    .pack((data, value, length, bitDepth) =>
    {
        for (let i = 0; i < length; i++) {
            const code = i > value.length - 1
                ? 0 // Write null byte
                : value.charCodeAt(i) // Write char
            data.writeInt(code, bitDepth)
        }
    })
    .build()

// Float
SchemaBuilder
    .create('float', SCHEMA.FLOAT)
    .validate(value => invariant(
        typeof value === 'number',
        'Tried to pack non number into a float field',
        value
    ))
    .unpack(data =>
    {
        // Read the series of bytes into an int array
        const ints = []
        for (let i = 0; i < 8; i++) {
            ints.push(data.readInt(8))
        }

        // Convert that to it's float64 representation
        const buffer = (new Uint8Array(ints)).buffer
        return (new Float64Array(buffer))[0]
    })
    .pack((data, value) =>
    {
        // Get the binary data as a series of bytes
        const buffer = (new Float64Array([value])).buffer
        const array = new Uint8Array(buffer)

        // Write each byte into the data
        for (const item of array) {
            data.writeInt(item, 8)
        }
    })
    .build()

// Image
SchemaBuilder
    .create('image', SCHEMA.IMAGE)
    .validate(value => invariant(
        value instanceof ImageData,
        'Tried to pack non image into an image field',
        value
    ))
    .unpack(data =>
    {
        const width = data.readInt(16)
        const height = data.readInt(16)

        const imageData = new ImageData(width, height)
        for (let i = 0; i < width * height * 4; i++)
            imageData.data[i] = data.readInt(8)

        return imageData
    })
    .pack((data, imageData) =>
    {
        data.writeInt(imageData.width, 16)
        data.writeInt(imageData.height, 16)
        for (const channel of imageData.data)
            data.writeInt(channel, 8)
    })
    .build()

SchemaBuilder
    .create('array', SCHEMA.ARRAY)
    .validate(value => invariant(value instanceof Array, 'Tried to pack non array as an array'))
    .argument('member', null, [
        value => invariant(
            isDefined(value),
            'Member schema definition is required'
        )
    ])
    .pack((data, array, schema, ...args) =>
    {
        data.writeInt(array.length, 32)
        for (const member of array) {
            data.pack(schema, member, ...args)
        }
    })
    .unpack((data, schema, ...args) =>
    {
        const length = data.readInt(32)
        const op = []

        for (let i = 0; i < length; i++) {
            op.push(data.unpack(schema, ...args))
        }

        return op
    })
    .build()

SchemaBuilder
    .create('object', SCHEMA.OBJECT)
    .validate(value => invariant(
        isPlainObject(value), 'Tried to pack non object as an object'
    ))
    .argument('properties', null, [
        value => invariant(
            isPlainObject(value),
            'Must provide object properties when reading / writing'
        )
    ])
    .pack((data, obj, properties) =>
    {
        for (const [key, value] of Object.entries(properties)) {
            const [schema, ...args] = ensureArray(value)
            data.pack(schema, obj[key], ...args)
        }
    })
    .unpack((data, properties) =>
    {
        const op = {}

        for (const [key, value] of Object.entries(properties)) {
            const [schema, ...args] = ensureArray(value)
            op[key] = data.unpack(schema, ...args)
        }

        return op
    })
    .build()
