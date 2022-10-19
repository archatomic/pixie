import { SimpleEmitter } from './SimpleEmitter'

export class ComplexEmitter
{
     /**
      * Initialize emitters dictionary and the root emitter
      */
    constructor() {
        this.emitters = {}
        this.root = new SimpleEmitter()
    }

    /**
     * Lazily instantiate an emitter by event name.
     *
     * @param {string} event
     * @memberof ComplexEmitter
     *
     * @returns {SimpleEmitter}
     */
    getEmitter(event) {
        if (event === '*') return this.root
        if (!this.emitters[event]) this.emitters[event] = new SimpleEmitter()
        return this.emitters[event]
    }

    /**
     * Add a listener to this emitter.
     *
     * @param {string} event
     * @param {IHandler<Event>} handler
     * @memberof ComplexEmitter
     *
     * @returns {() => void} A function that removes this handler.
     */
    listen(event, handler)
    {
        if (typeof event === 'string') return this.getEmitter(event).listen(handler)

        for (const _event of Object.keys(event)) {
            this.listen(_event, event[_event])
        }

        return () => this.stopListening(event)
    }

    /**
     * Add a listener that fires once, then removes itsself.
     *
     * @param {string} event
     * @param {IHandler<Event>} handler
     * @memberof Emitter
     *
     * @returns {() => void} A function that removes this handler.
     */
    once(event, handler)
    {
        if (typeof event === 'string') return this.getEmitter(event).once(handler)

        const unsubs = []
        for (const _event of Object.keys(event)) {
            unsubs.push(this.once(_event, event[_event]))
        }
        return () => unsubs.map(cb => cb())
    }

    /**
     * Remove a handler from the list.
     *
     * @param {string} event
     * @param {IHandler<Event>} handler
     * @memberof ComplexEmitter
     */
    stopListening(event, handler)
    {
        if (typeof event === 'string') return this.getEmitter(event).stopListening(handler)

        for (const _event of Object.keys(event)) {
            this.stopListening(_event, event[_event])
        }
    }

    /**
     * Fire an event.
     *
     * @param {string} event
     * @param {Event} event
     * @memberof ComplexEmitter
     */
    emit(event, ...data)
    {
        this.root.emit(event, ...data)

        if (typeof event === 'string') return this.emitters[event] && this.emitters[event].emit(...data)

        for (const _event of Object.keys(event)) {
            this.emit(_event, event[_event])
        }
    }
}