import classNames from 'classnames'
import { Component } from 'react'

/**
 * @typedef {object} ImageProps
 * @property {import('client/model/PixieCel')} cel
 * @property {string} [className]
 */

/**
 * @extends {Component<ImageProps>}
 */
export class Image extends Component
{
    /**
     * @type {HTMLCanvasElement}
     */
    canvas = null

    /**
     * @type {CanvasRenderingContext2D}
     */
    ctx = null

    get imageData ()
    {
        return this.props.cel.data
    }

    get width ()
    {
        return this.props.cel.width
    }

    get height ()
    {
        return this.props.cel.height
    }

    /**
     * @param {HTMLCanvasElement} canvas 
     */
    handleRef = canvas =>
    {
        if (this.canvas === canvas) return
        if (this.canvas) this.detachContext()
        if (!canvas) return
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d')
        this.updateImage()
    }

    detachContext ()
    {
        this.canvas = null
        this.ctx = null
    }

    componentDidUpdate ()
    {
        this.updateImage()
    }

    updateImage ()
    {
        if (!this.ctx || !this.imageData) return
        this.ctx.putImageData(this.imageData, 0, 0)
    }

    get style ()
    {
        const aspect = this.height / this.width
        return {
            '--ar': `${aspect * 100}%`,
            '--width': `${this.width}px`,
            '--height': `${this.height}px`
        }
    }

    render ()
    {
        return (
            <div
                className={classNames('Image', this.props.className)}
                style={this.style}
            >
                <canvas
                    className='Image-canvas'
                    width={this.props.cel.width}
                    height={this.props.cel.height}
                    ref={this.handleRef}
                />
            </div>
        )
    }
}