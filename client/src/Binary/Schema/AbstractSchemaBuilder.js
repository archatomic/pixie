import { BinaryData } from 'Pixie/Binary/BinaryData'
import { Schema } from 'Pixie/Binary/Schema/Schema'
import { schemaRepository } from 'Pixie/Binary/Schema/SchemaRespository'

/**
 * @typedef {import('Pixie/Binary/Schema/Schema').ValidateFunc} ValidateFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').ArgDef} ArgDef
 * @typedef {import('Pixie/Binary/Schema/Schema').UnpackFunc} UnpackFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').PackFunc} PackFunc
 */

export class AbstractSchemaBuilder
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
     * Create the schema, register it
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
        return this
    }

    addToBinaryData ()
    {
        BinaryData.addSchemaToPrototype(this.name)
        return this
    }
}
