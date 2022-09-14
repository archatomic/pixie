import { ColorSelector } from '../color-selector/ColorSelector'
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
                <div className='Layers-toolbar'>
                    <div className='Layers-toggle'>
                        <Tool.Connected icon={this.props.open ? 'close' : 'layer-group'} iconProps={{ rotateLeft: this.props.open }} onClick={applicationLayersToggle} />
                    </div>
                    <div className='Layers-spacer'></div>
                    <ColorSelector.Connected />
                </div>
                <Transition className='Layers-drawer'>
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
                <div className='Layers-preview' style={{paddingBottom}}></div>
                <div className='Layers-name'>{layer.name}</div>
            </li>
        )
    }

    renderAddLayerButton ()
    {
        // todo
        return null //<li onClick={}>Click me</li>
    }
}