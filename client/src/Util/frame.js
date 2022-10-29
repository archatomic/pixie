import { error } from 'Pixie/Util/log'

class FrameListener
{
    /**
     * @type {Map<Function, FrameHandler>}
     */
    handlers = new Map()
    running = false

    start ()
    {
        if (this.running) return
        this._frameHandle = requestAnimationFrame(this.loop)
        this.running = true
    }

    stop ()
    {
        if (!this.running) return
        this._frameHandle = cancelAnimationFrame(this._frameHandle)
        this.running = false
    }

    loop = () =>
    {
        if (!this.running) return
        this.handleFrame()
        this._frameHandle = requestAnimationFrame(this.loop)
    }

    subscribe (handler)
    {
        this.handlers.set(
            handler,
            new FrameHandler(handler)
        )

        return () => this.unsubscribe(handler)
    }

    unsubscribe (handler)
    {
        this.handlers.delete(handler)
    }

    handleFrame ()
    {
        for (const handler of this.handlers.values()) {
            handler.call()
        }
    }
}

const FRAME_WEIGHT = 60

class FrameHandler
{
    constructor(handler)
    {
        this.handler = handler
        this.performance = 0
        this.elapsed = 0
    }

    call ()
    {
        const start = Date.now()
        try {
            this.handler()
        } catch (e) {
            error(e)
        }
        const end = Date.now()
        this.addStat(start, end)
    }

    addStat (start, end)
    {
        const delta = end - start
        this.elapsed = delta
        this.performance = (this.performance * (FRAME_WEIGHT - 1) + this.elapsed) * FRAME_WEIGHT
    }
}

const listener = new FrameListener()
listener.start()

export function onFrame (handler)
{
    return listener.subscribe(handler)
}

export function offFrame (handler)
{
    return listener.unsubscribe(handler)
}
