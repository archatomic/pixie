import './Timeline.styl'

import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { tabActions } from 'client/store/actions/applicationActions'

/**
 * @typedef {object} TimelineProps
 * @property {import('client/model/PixieFragment').PixieFragment} fragment
 * @property {import('client/model/Tab').Tab} tab
 */
export class Timeline extends Component
{
    static Connected = connect(
        {
            'tab': (state) => state.get('application')?.getActiveTab(),
            'fragment': (state) => state.get('application')?.getActiveFragment(),
            'open': ['application', 'layers']
        },
        this
    )

    handleFrameActivate = (event) =>
    {
        event.stopPropagation()
        tabActions.save(this.props.tab.merge({
            frame: event.currentTarget.dataset.frame,
            layer: event.currentTarget.dataset.layer
        }))
    }
    
    handleLayerActivate = (event) =>
    {
        event.stopPropagation()
        tabActions.save(this.props.tab.merge({
            layer: event.currentTarget.dataset.layer
        }))
    }

    render ()
    {
        const frames = this.props.fragment.frames.toArray()
        return (
            <div className={classNames('Timeline', this.props.className, {'Timeline--open': this.props.open})}>
                <table className='Timeline-layers'>
                    <tbody>
                        {this.props.fragment.layers.toArray().map(
                            layer => this.renderLayer(layer, frames)
                        )}
                    </tbody>
                </table>
            </div>
        )
    }

    renderLayer (layer, frames)
    {
        return (
            <tr key={layer.pk} className='Timeline-layer' data-layer={layer.pk} onClick={this.handleLayerActivate}>
                <td className='Timeline-layer-name'>{layer.name}</td>
                { frames.map(frame => this.renderFrame(layer, frame))}
            </tr>
        )
    }

    renderFrame (layer, frame)
    {
        const cel = this.props.fragment.getCel(layer, frame)
        return (
            <td
                key={frame.pk}
                data-frame={frame.pk}
                data-layer={layer.pk}
                className={classNames('Timeline-cel', { [`Timeline-cel--empty`]: cel.inherits })}
                onClick={this.handleFrameActivate}
            ></td>
        )
    }
}
