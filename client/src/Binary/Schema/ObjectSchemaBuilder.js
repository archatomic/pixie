import { AbstractSchemaBuilder } from './AbstractSchemaBuilder'
import { invariant } from 'Pixie/Util/invariant'
import { isPlainObject } from 'Pixie/Util/isPlainObject'
import { ensureArray } from 'Pixie/Util/array'

/**
 * @typedef {import('Pixie/Binary/Schema/Schema').ValidateFunc} ValidateFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').ArgDef} ArgDef
 * @typedef {import('Pixie/Binary/Schema/Schema').UnpackFunc} UnpackFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').PackFunc} PackFunc
 */

export class ObjectSchemaBuilder extends AbstractSchemaBuilder
{
    validations = [value => invariant(
        isPlainObject(value),
        'Tried to pack a non object as an object'
    )]

    _properties = []

    property (key, schema, ...args)
    {
        this._properties.push([key, schema, ...args])
        return this
    }

    ignore (bits)
    {
        this._properties.push([null, 'ignore', bits])
        return this
    }

    properties (properties)
    {
        for (const [key, value] of Object.entries(properties)) {
            this.property(key, ...ensureArray(value))
        }
        return this
    }

    /**
     * @returns {PackFunc}
     */
    createPackFunc ()
    {
        const properties = [ ...this._properties ]
        return (
            data,
            value
        ) => data.writeObject(value, properties)
    }

    /**
     * @returns {UnpackFunc}
     */
    createUnpackFunc ()
    {
        const properties = [ ...this._properties ]
        return (data) => data.readObject(properties)
    }
}
