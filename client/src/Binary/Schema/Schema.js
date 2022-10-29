import { def } from 'Pixie/Util/default'

/**
 * @typedef {import('Pixie/Binary/BinaryData').BinaryData} BinaryData
 * @typedef {(data: BinaryData, value: any, ...args: any[]) => void} PackFunc
 * @typedef {(data: BinaryData, ...args: any[]) => any} UnpackFunc
 * @typedef {(value: any, ...args: any[]) => void} ValidateFunc
 *
 * @typedef {object} ArgDef
 * @property {string} name
 * @property {any} [default]
 * @property {ValidateFunc[]} [validations]
 *
 * @typedef {object} SchemaOptions
 * @property {string} name
 * @property {number} id
 * @property {PackFunc} pack
 * @property {UnpackFunc} unpack
 * @property {ValidateFunc[]} [validations]
 * @property {ArgDef[]} [args]
 */

export class Schema
{
    /**
     * @param {SchemaOptions} options
     */
    constructor({
        name,
        id,
        pack,
        unpack,
        validations = [],
        args = []
    } = {})
    {
        /** @type {string} */
        this.name = name

        /** @type {number} */
        this.id = id

        /** @type {number} */
        this.version = -1

        /** @type {ValidateFunc[]} */
        this.validations = validations

        /** @type {ArgDef[]} */
        this.arguments = args

        /** @type {PackFunc} */
        this.pack = pack

        /** @type {UnpackFunc} */
        this.unpack = unpack
    }

    validate (value, ...args)
    {
        this.applyValidations(value, this.validations, ...args)
    }

    applyValidations (value, validations, ...args)
    {
        if (!validations) return
        for (const validation of validations) {
            this.applyValidation(value, validation, ...args)
        }
    }

    applyValidation (value, validation, ...args)
    {
        validation(value, ...args)
    }

    /**
     * Reads from a reader, returns the value as a primitive, array, or object.
     *
     * @param {} data
     * @param  {...any} args
     *
     * @return {any}
     */
    read (data, ...args)
    {
        args = this.sanitizeArguments(args)
        return this.unpack(data, ...args)
    }

    /**
     * Writes to binary data.
     *
     * @param {*} value
     * @param {import('Pixie/Binary/BinaryData').BinaryData} data
     * @param  {...any} args
     *
     * @return {*}
     */
    write (data, value, ...args)
    {
        args = this.sanitizeArguments(args)
        this.validate(value, ...args)
        return this.pack(data, value, ...args)
    }

    sanitizeArguments (args)
    {
        return this.arguments.map(
            (arg, i) => this.applyArgument(args[i], arg)
        ).concat(args.slice(this.arguments.length))
    }

    applyArgument (arg, argDefinition)
    {
        arg = def(arg, argDefinition.default)
        this.applyValidations(arg, argDefinition.validations, argDefinition)
        return arg
    }
}
