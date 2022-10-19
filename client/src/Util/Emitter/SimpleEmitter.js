export class SimpleEmitter
{
    handlers = []

    /**
     * Add a listener to this emitter.
     *
     * @param {(event: any) => void} handler
     *
     * @returns {() => void)} A function that removes this handler.
     */
    listen(handler)
    {
        this.handlers.push(handler)
        return this.stopListening.bind(this, handler)
    }

    /**
     * Add a listener that fires once, then removes itsself.
     *
     * @param {(event: any) => void} handler
     *
     * @returns {() => void)} A function that removes this handler.
     */
    once(handler)
    {
        let _handler = (event) => {
            try {
                handler(event)
            } catch (e) {
                console.error(e)
            }

            this.stopListening(_handler)
        }

        return this.listen(_handler)
    }

    /**
     * Remove a handler from the list.
     *
     * @param {(event: any) => void} handler
     */
    stopListening(handler)
    {
        const index = this.handlers.indexOf(handler)
        if (index < 0) return
        this.handlers.splice(index, 1)
    }

    /**
     * Fire an event.
     *
     * @param {any} event
     */
    emit()
    {
        for (let handler of this.handlers) {
            try {
                handler.apply(this, arguments)
            } catch(e) {
                console.error(e)
            }
        }
    }
}
