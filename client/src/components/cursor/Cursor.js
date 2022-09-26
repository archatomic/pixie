import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { imageDataToDataURI } from 'client/util/graphics'
import { Component } from 'react'

/**
 * @typedef {object} CursorProps
 * @property {import('client/tools/BaseTool').CursorData} [data]
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

    get isCssCursor ()
    {
        return typeof this.props.data === 'string'
    }

    get isFunctionCursor ()
    {
        return this.props.data instanceof Function
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
                        'Cursor--image': this.isImageCursor,
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
        if (this.isImageCursor) return this.renderImageDataCursor()
        if (this.isFunctionCursor) return this.renderFunctionCursor()
        return null
    }

    renderImageDataCursor ()
    {
        const datauri = this.getDataUri (this.props.data)
        return <img className='Cursor-cursor' src={datauri} style={this.style}/>
    }

    renderFunctionCursor ()
    {
        const fn = this.props.data

        const x = this.props.x
        const y = this.props.y
        return <div className='Cursor-cursor' style={this.style}>{fn()} </div>
    }
}