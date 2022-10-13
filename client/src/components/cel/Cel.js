import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { Image } from 'client/components/image'

import './Cel.styl'

/**
 * @typedef {object} CelProps
 * @prop {import('client/model/PixieCel').PixieCel} cel 
 * @prop {string} [className] 
 * @prop {boolean} [omitPreview] 
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

    get style ()
    {
        return {
            width: `${this.props.cel.width / 10}rem`,
            height: `${this.props.cel.height / 10}rem`,
        }
    }

    render ()
    {
        if (this.props.cel.null) return null

        const showPreview = !!this.props.cel.preview && !this.props.omitPreview
        const showData = !showPreview || this.props.cel.overlayPreview

        return (
            <div className={classNames('Cel', this.props.className)} style={this.style}>
                { showPreview && <Image className='Cel-canvas' data={this.props.cel.preview}/> }
                { showData && <Image className='Cel-canvas' data={this.props.cel.data}/> }
            </div>
        )
    }
}