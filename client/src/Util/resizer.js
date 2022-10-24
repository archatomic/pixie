import { offFrame, onFrame } from 'Pixie/Util/frame'
import { safeCallIgnore } from 'Pixie/Util/safeCall'

class Resizer
{
    /**
     * @type {Map<HTMLElement, ResizeHandler>}
     */
    handlers = new Map()

    getHandler (element)
    {
        if (!this.handlers.has(element)) {
            this.handlers.set(
                element,
                new ResizeHandler(element)
            )
        }
        return this.handlers.get(element)
    }

    subscribe (element, callback)
    {
        this.getHandler(element).add(callback)
        return () => this.unsubscribe(element, callback)
    }

    unsubscribe (element, callback)
    {
        if (!this.handlers.has(element)) return
        const handler = this.handlers.get(element)
        handler.remove(callback)
    }
}

class ResizeHandler
{
    constructor(target)
    {
        this.target = target
        this.callbacks = []
        this.listening = false
        this.rect = {
            top: 0,
            left: 0,
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
        }
    }

    sync ()
    {
        if (this.callbacks.length === 0) this.stop()
        else this.start()
    }

    start ()
    {
        if (this.listening) return
        onFrame(this.handleFrame)
        this.listening = true
    }

    stop ()
    {
        if (!this.listening) return
        offFrame(this.handleFrame)
        this.listening = false
    }

    handleFrame = () =>
    {
        const rect = this.target.getBoundingClientRect()
        let updated = false

        for (const key of Object.keys(this.rect)) {
            if (this.rect[key] !== rect[key]) {
                updated = true
                this.rect[key] = rect[key]
            }
        }

        if (!updated) return // bail

        for (const callback of this.callbacks) {
            safeCallIgnore(callback, this.rect)
        }
    }

    add (callback)
    {
        this.callbacks.push(callback)
        this.sync()
    }

    remove (callback)
    {
        this.callbacks = this.callbacks.filter(c => c !== callback)
        this.sync()
    }
}

const instance = new Resizer()

export function watchBounds (element, handler)
{
    return instance.subscribe(element, handler)
}

export function unwatchBounds (element, handler)
{
    return instance.unsubscribe(element, handler)
}
