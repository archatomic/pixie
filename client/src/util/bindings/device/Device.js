import { AnalogInput } from 'Pixie/util/bindings/device/AnalogInput'
import { ButtonInput } from 'Pixie/util/bindings/device/ButtonInput'
import { DeviceInput } from 'Pixie/util/bindings/device/DeviceInput'
import { Emitter } from 'Pixie/util/emitter'

export class Device extends Emitter
{
    /**
     * @param {string} id Name of this device. Ideally human readable. Required unique.
     */
    constructor(id)
    {
        super()

        /**
         * @type {string}
         */
        this.id = id

        /**
         * @type {{[string]: DeviceInput}}
         */
        this.state = {}
    }

    /**
     * Retrieve a simple copy of the state of this device.
     * 
     * It's a map of input name => input value.
     *
     * @returns {{[string]: any}}
     */
    getState ()
    {
        const op = {}
        for (const input of Object.keys(this.state)) {
            op[input] = this.state[input].value
        }
        return op
    }

    /**
     * Get (or create) a button by name, and then set its value.
     *
     * @param {string} input Name of the input
     * @param {boolean} value New value
     */
    setButton (input, value, event = null)
    {
        this.getInput(input, ButtonInput).set(value, event)
    }

    /**
     * Get (or create) an analog by name, and then set its value.
     *
     * @param {string} input Name of the input
     * @param {boolean} value New value
     */
    setAnalog (input, value, event = null)
    {
        this.getInput(input, AnalogInput).set(value, event)
    }

    /**
     * Get a button by name.
     *
     * @param {string} input Name of the input
     */
    getButton (input)
    {
        return this.getInput(input, ButtonInput)
    }

    /**
     * Get a button by name.
     *
     * @param {string} input Name of the input
     */
    getAnalog (input)
    {
        return this.getInput(input, AnalogInput)
    }

    /**
     * @template DeviceType
     * @param {DeviceInput} DeviceType
     * @param {string} id 
     * @param {function(new:DeviceType)} kls 
     * @returns {DeviceType}
     */
    getInput (id, kls)
    {
        const input = this.state[id] || this.createInput(id, kls)

        // Enforce class constraint
        if (input instanceof kls === false)
            throw new Error(`InputTypeConstraintError: Input ${id} is not a ${kls.name}`)

        return input
    }

    /**
     * @param {string} id 
     * @returns {ButtonInput}
     */
    createButton (id)
    {
        return this.createInput(id, ButtonInput)
    }

    /**
     * @param {string} id 
     * @returns {AnalogInput}
     */
    createAnalog (id)
    {
        return this.createInput(id, AnalogInput)
    }

    /**
     * @template DeviceType
     * @param {DeviceInput} DeviceType
     * @param {string} id 
     * @param {function(new:DeviceType)} kls 
     * @returns {DeviceType}
     */
    createInput (id, kls = DeviceInput)
    {
        // Enforce does not exist constraint
        if (this.state[id])
            throw new Error(`InputAlreadyExistsError: Input with id ${id} already exists on this device`)

        const input = new kls(id)
        input.listen(this.handleInput)
        this.state[id] = input
        this.createGetterSetter(id)
        return input
    }

    /**
     * Register getter setters for the provided input.
     *
     * @param {string} inputID
     */
    createGetterSetter (inputID)
    {
        if (this[inputID]) return // bail on overwriting
        Object.defineProperty(this, inputID, {
            get: () => this.state[inputID].value,
            set: (v) => this.state[inputID].value = v
        })
    }

    // drag (button, analogs, handler) => {
        // This is button.down, analog.change, button.up
    // }

    handleInput = (event) =>
    {
        const eventName = `${this.id}.${event.input}.${event.type}`
        this.emit(eventName, {
            device: this.id,
            ...event
        })
    }
}