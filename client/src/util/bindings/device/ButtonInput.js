import { DeviceInput } from 'client/util/bindings/device/DeviceInput'
import { def } from 'client/util/default'

const HOLD_TIMEOUT = 1000

/**
 * TODO: Support variable hold timeouts for the same button.
 * 
 * These do not interact with the press event.
 *
 * e.g.
 * pen.nib.hold(300, handler)
 * pen.nib.hold(500, otherHandler)
 * 
 * A hold for 200 fires neither and the press event
 * a hold for 400 fires handler and the press event
 * a hold for 600 fires both and the press event
 * a hold for 1100 fires both and the hold event
 * 
 * Alternatively, you can cancel the press event with a hold
 * event. Maybe that's an option.
 * 
 * e.g.
 * pen.nib.hold(300, handler, {cancelPress: true})
 * 
 * A hold of 200 emits press
 * A hold of 400 calls handler
 * a hold of 1100 emits hold and calls handler
 */

/**
 * @extends DeviceInput<boolean>
 */
export class ButtonInput extends DeviceInput
{  
    holdTimeout = HOLD_TIMEOUT

    /**
     * @param {string} id
     * @param {boolean} [value] 
     */
    constructor(id, value = false)
    {
        super(id, def(value, false))
        this._timeout = null
    }

    /**
     * @param {any} [value] 
     * @returns {boolean}
     */
    validate (value)
    {
        return (value === true || value === false)
    }

    /**
     * Emit events. We're extending the base events that a DeviceInput
     * gives us with support for the 'down' 'up' 'press' and 'hold'
     * events.
     *
     * @param {boolean} value 
     * @param {boolean} previous 
     */
    handleValueChanged (value, previous, event = null)
    {
        const time = Date.now()
        const down = value && !previous

        if (down) this.triggerDown(time, event)
        this.triggerChange(time, value, previous, event)
        if (!down) this.triggerUp(time, event)
    }

    /**
     * Emit the change event.
     * 
     * @param {number} time 
     * @param {boolean} value 
     * @param {boolean} previous 
     */
    triggerChange (time, value, previous, event = null)
    {
        this.emit({
            time,
            input: this.id,
            type: 'change',
            value,
            previous,
            event
        })
    }

    /**
     * Emit the down event. Also starts the hold timer.
     * 
     * @param {number} time
     */
    triggerDown (time, event = null)
    {
        this.emit({
            input: this.id,
            type: 'down',
            time,
            event
        })
        clearTimeout(this._timeout) // Just in case
        this._timeout = setTimeout(() => this.triggerHold(event), this.holdTimeout)
    }

    /**
     * Emit the hold event. Also clean up any straggling timeouts.
     * 
     * @param {number} time
     */
    triggerHold(event = null) {
        clearTimeout(this._timeout) // Just in case
        this._timeout = null
        this.emit({
            input: this.id,
            type: 'hold',
            time: Date.now(),
            event
        })
    }

    /**
     * Triggers the up event. If we're still in the press window (if
     * we're still waiting on the hold timeout) also triggers the
     * press event.
     *
     * @param {number} time 
     */
    triggerUp (time, event  = null)
    {
        this.emit({
            input: this.id,
            type: 'up',
            time,
            event
        })

        if (this._timeout !== null) this.triggerPress(time, event)
    }

    /**
     * Trigger the press event. Also clean up any straggling timeouts.
     *
     * @param {number} time 
     */
    triggerPress (time, event  = null)
    {
        clearTimeout(this._timeout) // Just in case
        this._timeout = null
        this.emit({
            input: this.id,
            type: 'press',
            time,
            event
        })
    }
}