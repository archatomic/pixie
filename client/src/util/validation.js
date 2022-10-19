/**
 * @typedef {(value: any, ...args: any[]) => void} Validator
 */

import { ensureArray } from './array'
import { isEmpty } from './default'

/**
 * @type {Object<string, Validator>}
 */
const validators = {}

/**
 * Apply a new validator
 *
 * @param {string} name
 * @param {Validator} validator
 */
export function registerValidator (name, validator)
{
    validators[name] = validator
}

/**
 * Validate a value given a list of validators, return the result.
 *
 * @todo Create a ValidatorConfig type and use that instead of any[]
 *
 * @param {any} value
 * @param {any[]} validators
 *
 * @returns {Error[]}
 */
export function validate (value, validators)
{
    const op = []
    for (const v of ensureArray(validators)) {
        try {
            const [valName, ...args] = ensureArray(v)
            const validator = getValidator(valName)
            validator(value, ...args)
        } catch (e) {
            op.push(e)
        }
    }
    return op
}

/**
 * Get a validator by the provided name
 *
 * @param {any} validator
 *
 * @returns {Validator}
 */
function getValidator (validator)
{
    if (!validator) throw new Error('Empty validator found')
    if (typeof validator === 'function') return validator
    if (validators[validator]) return validators[validator]
    throw new Error(`Unknown validator: ${validator}`)
}

registerValidator('required', value =>
{
    if (isEmpty(value)) throw new Error('This field is required')
})
