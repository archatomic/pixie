import { Device } from 'Pixie/util/bindings/device/Device'
import { Emitter } from 'Pixie/util/emitter'

export class DeviceManager extends Emitter
{
    constructor()
    {
        super()

        /**
         * @type {{[string]: Device}}
         */
        this.devices = {}

        this.createMouse()
        this.createKeyboard()
        this.createPen()
        // this.createHand()

        // This is a special case input... I think it should have
        // support for x number of fingers. Each finger is individually
        // addressible, and I do the mapping for you.

        /**
         * dm.listen('hand.touch.down')
         * dm.listen('hand.secondTouch.down')... etc
         */
    }

    createDevice (id, buttons = [], analogs = [])
    {
        if (this.devices[id]) throw new Error(`DeviceIDError: Device ID already exists ${id}`)

        const device = new Device(id)

        for (const button of buttons) {
            device.createButton(button)
        }

        for (const analog of analogs) {
            device.createAnalog(analog)
        }

        this.devices[id] = device

        device.listen('*', this.handleDeviceEvent)

        if (!this[id]) Object.defineProperty(this, id, {
            get: () => this.devices[id]
        })

        return device
    }

    createPen ()
    {
        return this.createDevice(
            'pen',
            ['nib', 'eraser', 'barrel'],
            ['x', 'y', 'pressure', 'tiltX', 'tiltY', 'twist']
        )
    }

    createMouse ()
    {
        return this.createDevice(
            'mouse',
            ['left', 'middle', 'right', 'back', 'forward'],
            ['x', 'y', 'wheelX', 'wheelY']
        )
    }

    createKeyboard ()
    { return this.createDevice('keyboard') }

    handleDeviceEvent = (event, data) =>
    { this.emit(event, data) }
}