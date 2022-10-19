import classNames from 'classnames'
import { SparseImage } from 'Pixie/Model/SparseImage'
import { connect } from 'Pixie/Util/connect'
import { imageDataToDataURI } from 'Pixie/Util/graphics'
import { Component } from 'react'

/**
 * @typedef {object} CursorProps
 * @property {import('Pixie/Tool/BaseTool').CursorData} [data]
 * @property {number} scale
 * @property {number} x
 * @property {number} y
 * @property {boolean} show
 */

const imageDataMap = new Map()

/**
 * @extends {Component<CursorProps>}
 */
export class Cursor extends Component
{
    static Connected = connect(
        {
            x: ['application', 'cursorX'],
            y: ['application', 'cursorY'],
            show: ['application', 'cursorDown']
        },
        this
    )

    getDataUri (imagedata)
    {
        if (!imageDataMap.has(imagedata)) {
            imageDataMap.set(imagedata, imageDataToDataURI(imagedata))
        }
        return imageDataMap.get(imagedata)
    }

    get hasCursor ()
    {
        return !!this.props.data
    }

    get isImageCursor ()
    {
        return this.props.data instanceof ImageData
    }

    get hasImage ()
    {
        return this.isImageCursor || this.isSparseImageCursor
    }

    get isCssCursor ()
    {
        return typeof this.props.data === 'string'
    }

    get isFunctionCursor ()
    {
        return this.props.data instanceof Function
    }

    get isSparseImageCursor ()
    {
        return this.props.data instanceof SparseImage
    }

    get cssCursor ()
    {
        if (this.isCssCursor) return this.props.data
        return this.hasCursor ? 'none' : 'auto'
    }

    render ()
    {
        if (!this.props.show) return null

        return (
            <div
                className={classNames(
                    'Cursor',
                    this.props.className,
                    {
                        'Cursor--image': this.hasImage,
                        'Cursor--css': this.isCssCursor,
                        'Cursor--function': this.isFunctionCursor
                    }
                )}
                style={{ cursor: this.cssCursor }}
            >
                {this.renderCursor()}
            </div>
        )
    }

    get style ()
    {
        const data = this.props.data

        // supporting offset overloads on image data
        const x = (data.offsetX || 0) + this.props.x
        const y = (data.offsetY || 0) + this.props.y

        return {
            transform: `scale(${this.props.scale}) translate(${x}px, ${y}px)`
        }
    }

    renderCursor ()
    {
        if (this.isSparseImageCursor) return this.renderSparseImageCursor()
        if (this.isImageCursor) return this.renderImageDataCursor()
        if (this.isFunctionCursor) return this.renderFunctionCursor()
        return null
    }

    renderSparseImageCursor ()
    {
        const datauri = this.props.data.dataURI
        return <img className='Cursor-cursor' src={datauri} style={this.style} />
    }

    renderImageDataCursor ()
    {
        const datauri = this.getDataUri(this.props.data)
        return <img className='Cursor-cursor' src={datauri} style={this.style} />
    }

    renderFunctionCursor ()
    {
        const fn = this.props.data
        return <div className='Cursor-cursor' style={this.style}>{fn()} </div>
    }
}
