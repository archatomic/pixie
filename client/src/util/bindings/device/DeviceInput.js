import { SimpleEmitter } from 'client/util/emitter/SimpleEmitter'
import { warn } from 'client/util/log'

/**
 * @template T
 */
export class DeviceInput extends SimpleEmitter
{
    /**
     * @param {string} id
     * @param {T} [value] 
     */
    constructor(id, value = null)
    {
        super()

        /** @type {string} */
        this.id = id

        if (!this.validate(value)) throw new Error(`InputInitialStateError: Invalid initial input value: ${value}`)

        /** @type {T} */
        this.state = value
    }

    /**
     * @type {T}
     */
    get value ()
    {
        return this.state
    }

    set value (value)
    {
        this.set(value)
    }

    /**
     * Overrideable validation strategy.
     *
     * @param {any} value
     * @returns {boolean}
     */
    validate (_)
    {
        return true
    }

    /**
     * Update the value of this input, trigger events.
     *
     * @param {T} set 
     */
    set (value, event = null)
    {
        if (!this.validate(value)) return warn(`InvalidInputValueError: Ignoring input value: ${value}`)
        if (this.state === value) return
        const previous = this.state
        this.state = value
        this.handleValueChanged(this.state, previous, event)
    }

    /**
     * Trigger events.
     *
     * @param {T} value 
     * @param {T} previous 
     */
    handleValueChanged (value, previous, event = null)
    {
        this.emit({
            input: this.id,
            type: 'change',
            time: Date.now(),
            previous,
            value,
            event
        })
    }
}
