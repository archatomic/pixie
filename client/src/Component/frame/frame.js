import classNames from 'classnames'
import { Cel } from 'Pixie/Component/cel/Cel'
import { connect } from 'Pixie/util/connect'
import { def } from 'Pixie/util/default'
import { Component } from 'react'

/**
 * @typedef {object} FrameProps
 * @property {import('Pixie/model/PixieCel').PixieCel[]} cels
 * @property {import('client.constants').VISIBILITY} [layerVisibility]
 * @property {import('client.constants').CEL_DISPLAY_MODE} [celDisplayMode]
 * @property {string} [className]
 */

/**
 * @extends {Component<FrameProps>}
 */
export class Frame extends Component
{
    static Connected = connect(
        (state, props) =>
        {
            const frame = state.frames.find(props.frame)
            const fragment = state.fragments.find(frame.fragment)

            const cels = fragment.getCels({
                frame: frame.pk,
                visible: def(props.layerVisibility, true)
            }).map(c => c.cel)

            return {
                cels: state.cels.findAll(cels).toArray()
            }
        },
        this
    )

    render ()
    {
        return (
            <div className={classNames('Frame', this.props.className)} style={this.props.style}>
                {this.props.cels.map(this.renderCel)}
            </div>
        )
    }

    renderCel = (cel, pos) => <Cel key={pos} className='Frame-cel' cel={cel} displayMode={this.props.celDisplayMode}/>
}