const POINTER_BUTTONS = {
    pen: {
        0: 'nib',
        2: 'barrel',
        5: 'eraser',
    },
    mouse: {
        0: 'left',
        1: 'middle',
        2: 'right',
        3: 'back',
        4: 'forward',
    }
}

const POINTER_ANALOGS = {
    pen: {
        x: 'clientX',
        y: 'clientY',
        tiltX: 'tiltX',
        tiltY: 'tiltY',
        twist: 'twist',
        pressure: 'pressure'
    },
    mouse: {
        x: 'clientX',
        y: 'clientY'
    }
}

export class EventBridge
{
    constructor()
    {
        this.deviceManager = null
        document.addEventListener('pointerdown', this.handlePointerDown)
        document.addEventListener('pointerup', this.handlePointerUp)
        document.addEventListener('pointermove', this.handlePointerMove)
        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('keyup', this.handleKeyUp)
        // TODO mousewheel
        // TODO gamepad
    }

    setDeviceManager (deviceManager)
    {
        this.deviceManager = deviceManager
    }

    handlePointerDown = (event) =>
    {
        if (!this.deviceManager) return
        event.preventDefault()
        this.handlePointerMove(event)
        this.handlePointerButton(event, true)
    }

    handlePointerUp = (event) =>
    {
        if (!this.deviceManager) return
        event.preventDefault()
        this.handlePointerMove(event)
        this.handlePointerButton(event, false)
    }

    handlePointerMove = (event) =>
    {
        if (!this.deviceManager) return
        const device = event.pointerType
        const analogs = POINTER_ANALOGS[device]

        if (!analogs) return
        for (const analog of Object.keys(analogs)) {
            const prop = analogs[analog]
            this.deviceManager[device].setAnalog(analog, event[prop], event)
        }
    }

    handlePointerButton = (event, value) =>
    {
        if (!this.deviceManager) return
        const device = event.pointerType
        if (!this.deviceManager[device]) return

        const buttons = POINTER_BUTTONS[device] || {}
        const button = buttons[event.button] || event.button

        this.deviceManager[device].setButton(button, value, event)
    }

    /**
     * @param {KeyboardEvent} e 
     */
    handleKeyDown = (event) =>
    {
        if (!this.deviceManager) return
        this.deviceManager.keyboard.setButton(event.key, true, event)
    }

    /**
     * @param {KeyboardEvent} e 
     */
    handleKeyUp = (event) =>
    {
        if (!this.deviceManager) return
        this.deviceManager.keyboard.setButton(event.key, false, event)
    }
}


