import classNames from 'classnames'
import { Component } from 'react'

/**
 * @typedef {object} ImageProps
 * @property {ImageData} data
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
        return this.props.data
    }

    get width ()
    {
        return this.imageData.width
    }

    get height ()
    {
        return this.imageData.height
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
        const checker = typeof this.props.checker === 'number' ? this.props.checker : 10
        return {
            '--ar': `${aspect * 100}%`,
            '--width': `${this.width / 10}rem`,
            '--height': `${this.height / 10}rem`,
            '--checker': `${checker / 10}rem`,
        }
    }

    render ()
    {
        if (!this.imageData) return null

        return (
            <div
                className={classNames(
                    'Image',
                    this.props.className,
                    {
                        'Image--checker': this.props.checker
                    }
                )}
                style={this.style}
            >
                <canvas
                    className='Image-canvas'
                    width={this.width}
                    height={this.height}
                    ref={this.handleRef}
                />
            </div>
        )
    }
}