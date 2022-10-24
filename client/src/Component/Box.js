import { def } from 'Pixie/Util/default'
import { unwatchBounds, watchBounds } from 'Pixie/Util/resizer'
import { safeCall } from 'Pixie/Util/safeCall'
import { ucFirst } from 'Pixie/Util/string'
import { Component } from 'react'

export class Box extends Component
{
    observer = null

    ensureObserver ()
    {
        if (this.observer) return
        this.observer = new IntersectionObserver(this.handleResize)
    }

    destroyObserver ()
    {
        this.observer.disconnect()
        this.observer = null
    }

    componentDidMount ()
    {
        this.ensureObserver()
    }

    componentWillUnmount ()
    {
        unwatchBounds(this.el, this.handleResize)
    }

    componentDidUpdate (_, s)
    {
        let resized = false

        for (const key of Object.keys(this.state)) {
            if (this.state[key] === s[key]) continue
            this.emit(key, this.state[key], s[key])
            resized = true
        }

        if (resized) this.emit('resize', this.state, s)
    }

    setRect (rect)
    {
        this.setState({
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y
        })
    }

    emit (eventName, value, oldValue)
    {
        const handlerName = `on${ucFirst(eventName)}`
        safeCall(
            this.props[handlerName],
            {
                type: eventName,
                target: this.el,
                value,
                oldValue
            }
        )
    }

    state = {
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0
    }

    handleRef = el =>
    {
        if (this.el && el !== this.el) unwatchBounds(this.el, this.handleResize)
        if (el) watchBounds(el, this.handleResize)
        this.el = el
    }

    handleResize = rect =>
    {
        this.setRect(rect)
    }

    render ()
    {
        const {
            tag,

            // Event handlers
            onResize,
            onTop,
            onBottom,
            onLeft,
            onRight,
            onX,
            onY,
            onWidth,
            onHeight,

            // Pass through everything else
            ...props
        } = this.props
        const C = def(tag, 'div')
        return <C ref={this.handleRef} {...props} />
    }
}
