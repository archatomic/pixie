import './Timeline.styl'

import { Component } from 'client/components/Component'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { tabActions } from 'client/store/actions/applicationActions'

/**
 * @typedef {object} TimelineProps
 * @property {import('client/model/PixieFragment').PixieFragment} fragment
 * @property {import('client/model/Application').Tab} tab
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

    bemBlock () { return 'Timeline' }

    bemVariants () { return ['open'] }

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
            <div className={this.className}>
                <table className={this.bemElement('layers')}>
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
            <tr key={layer.pk} className={this.bemElement('layer')} data-layer={layer.pk} onClick={this.handleLayerActivate}>
                <td className={this.bemElement('layer-name')}>{layer.name}</td>
                { frames.map(frame => this.renderFrame(layer, frame))}
            </tr>
        )
    }

    renderFrame (layer, frame)
    {
        const cel = this.props.fragment.getCel(layer, frame)
        const kls = this.bemElement('cel')
        return (
            <td
                key={frame.pk}
                data-frame={frame.pk}
                data-layer={layer.pk}
                className={classNames(kls, { [`${kls}--empty`]: cel.inherits })}
                onClick={this.handleFrameActivate}
            ></td>
        )
    }
}
