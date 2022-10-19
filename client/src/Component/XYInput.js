import { warn } from 'Pixie/util/log'
import { clamp } from 'Pixie/util/math'
import { safeCall } from 'Pixie/util/safeCall'
import { Component } from 'react'

export class XYInput extends Component
{
    handlePointerDown = (e) =>
    {
        e.currentTarget.setPointerCapture(e.pointerId)
        safeCall(this.props.onStart)
        this.handlePointerMove(e)
        e.currentTarget.addEventListener('pointermove', this.handlePointerMove)
    }

    handlePointerMove = (e) =>
    {
        const rect = this.getRect(e.currentTarget)
        if (!rect) return
        safeCall(this.props.onInput, {
            x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
            y: clamp((e.clientY - rect.top) / rect.height, 0, 1)
        })
    }

    getRect (el)
    {
        if (this.props.selector) el = el.querySelector(this.props.selector)
        if (!el) return warn(`XYInput selector does not resolve to an element: ${this.props.selector}`)
        return el.getBoundingClientRect()
    }

    handlePointerUp = (e) =>
    {
        e.currentTarget.removeEventListener('pointermove', this.handlePointerMove)
        this.handlePointerMove(e)
        safeCall(this.props.onStop)
    }

    render ()
    {
        const { onInput, onStart, onStop, ...props } = this.props
        return <div
            {...props}
            onPointerDown={this.handlePointerDown}
            onPointerUp={this.handlePointerUp}
        />
    }
}
