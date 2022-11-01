import { invariant } from 'Pixie/Util/invariant'
import { AbstractSchemaBuilder } from './AbstractSchemaBuilder'

/**
 * @typedef {import('Pixie/Binary/Schema/Schema').UnpackFunc} UnpackFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').PackFunc} PackFunc
 */

export class ArraySchemaBuilder extends AbstractSchemaBuilder
{
    validations = [value => invariant(
        value instanceof Array,
        'Tried to pack a non array as an array'
    )]

    /**
     * @param {string} Schema
     * @returns {ArraySchemaBuilder}
     */
    member (schema, ...args)
    {
        this.memberSchema = schema
        this.memberSchemaArgs = args
        return this
    }

    /**
     * @returns {PackFunc}
     */
    createPackFunc ()
    {
        // This closure has a reference to both schema and args,
        // which keeps them from being lost
        const schema = this.memberSchema
        const args = this.memberSchemaArgs || []
        return (
            data,
            value
        ) => data.writeArray(value, schema, ...args)
    }

    /**
     * @returns {UnpackFunc}
     */
    createUnpackFunc ()
    {
        // This closure has a reference to both schema and args,
        // which keeps them from being lost
        const schema = this.memberSchema
        const args = this.memberSchemaArgs || []
        return (data) => data.readArray(schema, ...args)
    }
}
