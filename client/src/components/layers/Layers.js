import { Component } from 'react'
import { Tool } from '../toolbar'
import { Transition } from '../Transition'
import { applicationLayersToggle } from 'client/store/actions/applicationActions'
import classNames from 'classnames'
import { connect } from 'client/util/connect'

export class Layers extends Component
{
    static Connected = connect(
        {
            open: ['application', 'layers'],
            aspect: (state) => state.get('application')?.getActiveFragment()?.aspectRatio,
            layers: (state) =>
            {
                const application = state.get('application')
                const tab = application?.getActiveTab()
                const fragment = application?.getActiveFragment()
                const layers = fragment?.layers?.toArray() || []
                return layers.map(layer => (
                {
                    layer,
                    cel: fragment.getCel(layer, tab.frame)
                }))
            }
        },
        this
    )

    render ()
    {
        return (
            <div className={classNames('Layers', { 'Layers--open': this.props.open })}>
                <Tool.Connected className='Layers-toggle' icon={this.props.open ? 'close' : 'layer-group'} onClick={applicationLayersToggle} />
                <Transition>
                    {this.renderLayerList()}
                </Transition>
            </div>
        )
    }

    renderLayerList ()
    {
        if (!this.props.layers) return null
        return (
            <ol className='Layers-list'>
                {this.props.layers.map(layer => this.renderLayer(layer))}
                {this.renderAddLayerButton()}
            </ol>
        )
    }

    renderLayer ({ layer, cel })
    {
        if (layer.null) return null

        const paddingBottom = `${this.props.aspect * 100}%`

        return (
            <li key={layer.pk} className='Layers-layer'>
                <li className='Layers-preview' style={{paddingBottom}}></li>
                <li className='Layers-name'>{layer.name}</li>
            </li>
        )
    }

    renderAddLayerButton ()
    {
        // todo
        return null //<li onClick={}>Click me</li>
    }
}