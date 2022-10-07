import { Component } from 'react'
import { Transition } from 'client/components/Transition'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { Image } from 'client/components/image'
import { Icon } from 'client/components/icon/icon'
import { def } from 'client/util/default'
import { VISIBILITY } from 'client/constants'
import { fragmentActions, tabActions } from 'client/store/actions/applicationActions'
import { Text } from 'client/components/field/Text'

export class Layers extends Component
{
    static Connected = connect(
        (state, props) =>
        {
            /**
             * @type {import('client/model/Application').Application}
             */
            const application = state.get('application')
            const fragment = application.getActiveFragment()
            const tab = application.getActiveTab()

            return {
                open: application.layers,
                tab,
                fragment,
                layerPos: fragment.layers.positionOf(tab.layer),
                layers: fragment.layers
            }
        },
        this
    )

    handleLayerAdd = () =>
    {
        const newPos = this.props.layerPos + 1
        fragmentActions.save(this.props.fragment.addLayer(newPos), { history: 'Create Layer' })
        tabActions.save(this.props.tab.set('layer', newPos))
    }

    render ()
    {
        return (
            <div className={classNames('Layers', { 'Layers--open': this.props.open })}>
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
            <div className='Layers-list'>
                {this.props.layers.toArray().reverse().map(layer => <Layer.Connected key={layer.pk} layer={layer}/>)}
                {this.renderAddLayerButton()}
            </div>
        )
    }

    renderAddLayerButton ()
    {
        return (
            <div
                className='Layers-add'
                onClick={this.handleLayerAdd}
            >
                <Icon
                    name='plus-square'
                    lined
                />
            </div>
        )
    }
}

class Layer extends Component
{
    static Connected = connect((state, props) =>
    {
        const application = state.get('application')
        const fragment = application.getActiveFragment()
        const tab = application.getActiveTab()
        const frame = fragment.frames.find(def(props.frame, tab.frame))
        const layer = fragment.layers.find(props.layer)
        const cel = fragment.getCel(layer, frame)
        
        return {
            fragment,
            frame,
            layer,
            cel,
            tab,
            active: layer.pk === fragment.layers.find(tab.layer).pk
        }
    }, this)

    handleVisibilityToggled = (e) =>
    {
        e.stopPropagation()
        const layer = this.props.layer
        const visibility = e.shiftKey
            ? (layer.soloed ? VISIBILITY.VISIBLE : VISIBILITY.SOLO)
            : (layer.isVisible() ? VISIBILITY.HIDDEN : VISIBILITY.VISIBLE)
        
        this.saveLayer(layer.set('visibility', visibility), 'Set Layer Visibility')
    }

    handleLayerActiveSet = (e) =>
    {
        if (this.props.active) return
        tabActions.save(this.props.tab.set('layer', this.props.layer.pk))
    }

    handleNameChanged = ({ value }) =>
    {
        this.saveLayer(this.props.layer.set('name', value), 'Set Layer Name')
    }

    saveLayer (layer, history = 'Save Layer')
    {
        const fragment = this.props.fragment
        fragmentActions.save(
            fragment.delegateSet('layers', 'add', layer),
            { history }
        )
    }

    handleDelete = () =>
    {
        const fragment = this.props.fragment
        fragmentActions.save(
            fragment.delegateSet('layers', 'remove', this.props.layer),
            { history: 'Remove Layer' }
        )
    }

    render ()
    {
        return (
            <div
                className={classNames(
                    'Layers-layer',
                    {
                        'Layers-layer--solo': this.props.layer.soloed,
                        'Layers-layer--hidden': this.props.layer.hidden,
                        'Layers-layer--visible': this.props.layer.visible,
                        'Layers-layer--active': this.props.active
                    }
                )}
                onClick={this.handleLayerActiveSet}
            >
                <div className='Layers-preview'>
                    <Image className='Layers-image' cel={this.props.cel} />
                </div>
                <div className='Layers-name'>
                    <Text
                        invisible
                        autoSelectOnFocus
                        value={this.props.layer.name}
                        onCommit={this.handleNameChanged}
                    />
                </div>
                <Icon
                    className='Layers-visibility'
                    name={this.props.layer.hidden ? 'eye-slash' : 'eye'}
                    onClick={this.handleVisibilityToggled}
                    lined
                />
                <Icon
                    className='Layers-delete'
                    name='trash'
                    onClick={this.handleDelete}
                />
            </div>
        )
    }
}
