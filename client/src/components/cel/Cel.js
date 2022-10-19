import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'Pixie/util/connect'
import { Image } from 'Pixie/components/image'

import './Cel.styl'
import { CEL_DISPLAY_MODE } from 'Pixie/constants'
import { def } from 'Pixie/util/default'

/**
 * @typedef {object} CelProps
 * @prop {import('Pixie/model/PixieCel').PixieCel} cel 
 * @prop {string} [className] 
 * @prop {CEL_DISPLAY_MODE} [displayMode] 
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

    get displayMode ()
    {
        return def(this.props.displayMode, CEL_DISPLAY_MODE.AUTO)
    }

    render ()
    {
        if (this.props.cel.null) return null

        return (
            <div className={classNames('Cel', this.props.className)}>
                { this.renderCommitted() }
                { this.renderPreview() }
            </div>
        )
    }

    renderPreview ()
    {
        if (this.displayMode === CEL_DISPLAY_MODE.COMMITTED) return null
        if (!this.props.cel.preview) return null
        return <Image className='Cel-canvas' data={this.props.cel.preview}/>
    }

    renderCommitted ()
    {
        if (this.displayMode === CEL_DISPLAY_MODE.PREVIEW) return null
        if (
            this.displayMode === CEL_DISPLAY_MODE.AUTO
            && this.props.cel.preview
            && !this.props.cel.overlayPreview
        ) return null
        return <Image className='Cel-canvas' data={this.props.cel.data}/>
    }
}