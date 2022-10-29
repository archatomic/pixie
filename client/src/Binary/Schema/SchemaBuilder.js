import { BinaryData } from 'Pixie/Binary/BinaryData'
import { Schema } from 'Pixie/Binary/Schema/Schema'
import { schemaRepository } from 'Pixie/Binary/Schema/SchemaRespository'
import { invariant } from 'Pixie/Util/invariant'
import { isPlainObject } from 'Pixie/Util/isPlainObject'

/**
 * @typedef {import('Pixie/Binary/Schema/Schema').ValidateFunc} ValidateFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').ArgDef} ArgDef
 * @typedef {import('Pixie/Binary/Schema/Schema').UnpackFunc} UnpackFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').PackFunc} PackFunc
 */

// TODO: Separate me into 4 separate files.
export class SchemaBuilder
{
    static create (name, id, type = 'primative')
    {
        invariant(
            this[type] instanceof Function,
            `Invalid schema type ${type}`
        )
        return this[type](name, id)
    }

    static primative (name, id)
    {
        return new PrimativeSchemaBuilder(name, id)
    }

    static object (name, id)
    {
        return new ObjectSchemaBuilder(name, id)
    }

    static array (name, id)
    {
        return new ArraySchemaBuilder(name, id)
    }
}

class AbstractSchemaBuilder
{

    constructor(name, id)
    {
        /**
         * @type {string}
         */
        this.name = name

        /**
         * @type {number}
         */
        this.id = id

        /**
         * @type {ArgDef[]}
         */
        this.arguments = []

        /**
         * @type {ValidateFunc[]}
         */
        this.validations = []
    }

    /**
     * @param {ValidateFunc} fn
     * @returns {AbstractSchemaBuilder}
     */
    validate (fn)
    {
        this.validations.push(fn)
        return this
    }

    /**
     * Add an argument to the schema signature. Used in read, write, and
     * validate operations.
     *
     * @param {string} name
     * @param {any} [def]
     * @param {ValidateFunc[]} [validations]
     * @param {any} [options]
     *
     * @returns {AbstractSchemaBuilder}
     */
    argument (name, def = null, validations = [])
    {
        this.arguments.push({
            name,
            default: def,
            validations
        })
        return this
    }

    /**
     * @returns {PackFunc}
     */
    createPackFunc ()
    {
        throw new Error("Unimplemented")
    }

    /**
     * @returns {UnpackFunc}
     */
    createUnpackFunc ()
    {
        throw new Error("Unimplemented")
    }

    /**
     * Create the schema, register it, and update the BinaryData prototype
     */
    build ()
    {
        const schema = new Schema({
            name: this.name,
            id: this.id,
            args: this.arguments,
            validations: this.validations,
            pack: this.createPackFunc(),
            unpack: this.createUnpackFunc()
        })
        schemaRepository.add(schema)
        BinaryData.addSchemaToPrototype(schema.name)
    }
}

class PrimativeSchemaBuilder extends AbstractSchemaBuilder
{
    /**
     * @param {PackFunc} fn
     * @returns {PrimativeSchemaBuilder}
     */
     pack (fn)
     {
         this._packFunc = fn
         return this
     }

     /**
      * @param {UnpackFunc} fn
      * @returns {PrimativeSchemaBuilder}
      */
     unpack (fn)
     {
         this._unpackFunc = fn
         return this
     }

    /**
     * @returns {PackFunc}
     */
     createPackFunc ()
     {
         return this._packFunc
     }

     /**
      * @returns {UnpackFunc}
      */
     createUnpackFunc ()
     {
         return this._unpackFunc
     }
}

class ArraySchemaBuilder extends AbstractSchemaBuilder
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

class ObjectSchemaBuilder extends AbstractSchemaBuilder
{
    validations = [value => invariant(
        isPlainObject(value),
        'Tried to pack a non object as an object'
    )]

    _properties = {}

    property (key, schema, ...args)
    {
        this._properties[key] = [schema, ...args]
        return this
    }

    properties (properties)
    {
        Object.assign(this._properties, properties)
        return this
    }

    /**
     * @returns {PackFunc}
     */
    createPackFunc ()
    {
        const properties = { ...this._properties }
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
        const properties = { ...this._properties }
        return (data) => data.readObject(properties)
    }
}
