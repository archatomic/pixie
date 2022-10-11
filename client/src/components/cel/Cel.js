import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_WIDTH } from 'client/constants'

import { Component } from 'react'
import classNames from 'classnames'
import { createNode } from 'client/util/createNode'
import { def } from 'client/util/default'
import { connect } from 'client/util/connect'

/**
 * @typedef {object} CelProps
 * @prop {import('client/model/PixieCel').PixieCel} cel 
 * @prop {string} [className] 
 */

/**
 * @extends {Component<CelProps>}
 */
export class Cel extends Component
{
    static Connected = connect(
        (state, props) =>
        {
            return {
                cel: state.cels.find(props.cel)
            }
        },
        this
    )

    handleRef = e =>
    {
        if (e) this.mountCanvas(e)
        else this.unmountCanvas()
    }

    /**
     * @returns {HTMLCanvasElement}
     */
    getCanvas ()
    {
        if (!this.canvas) {
            this.canvas = /** @type {HTMLCanvasElement} */ (
                createNode({
                    tag: 'canvas',
                    attrs: {
                        class: 'Cel-canvas',
                        width: def(this.props.cel.width, DEFAULT_FRAGMENT_WIDTH),
                        height: def(this.props.cel.height, DEFAULT_FRAGMENT_HEIGHT),
                    }
                }))

            this.ctx = this.canvas.getContext('2d')
            this.updateCanvasFromCel()
        }

        return this.canvas
    }

    updateCanvasFromCel ()
    {
        if (this.props.cel.data) this.ctx.putImageData(this.props.cel.data, 0, 0)
        else this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    updateCelFromCanvas ()
    {
        const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        console.log(`Update action, cel: ${this.props.cel.pk}, data: ${data}`)
    }

    mountCanvas (parent)
    {
        this.root = parent
        const canvas = this.getCanvas()
        this.root.appendChild(canvas)
    }

    unmountCanvas ()
    {
        this.root = null
    }

    componentDidUpdate (props)
    {
        if (props.cel !== this.props.cel) this.updateCanvasFromCel()
    }

    render ()
    {
        if (this.props.cel.null || !this.props.cel.data) return null

        return (
            <div className={classNames('Cel', this.props.className)} ref={this.handleRef}></div>
        )
    }
}