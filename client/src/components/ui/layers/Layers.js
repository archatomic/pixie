import { Component } from 'react'
import { Transition } from 'client/components/Transition'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { Image } from 'client/components/image'
import { Icon } from 'client/components/icon/icon'
import { VISIBILITY } from 'client/constants'
import { fragmentActions, layerActions, tabActions } from 'client/store/actions/applicationActions'
import { Text } from 'client/components/field/Text'
import { Operation } from 'client/store/operations'
import { safeCall } from 'client/util/safeCall'

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
            const cels = fragment.getCels({ frame: tab.frame })

            return {
                fragment: fragment.pk,
                open: application.layers,
                cels,
                layerPos: tab.layer
            }
        },
        this
    )

    handleLayerAdd = () =>
    {
        const newPos = this.props.layerPos + 1
        Operation.addLayerToFragment(this.props.fragment, newPos)
        Operation.pushHistory(this.props.fragment, 'Add Layer')
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
        return (
            <div className='Layers-list'>
                {this.props.cels.reverse().map(
                    ({layer, cel}) => <Layer.Connected
                        key={cel}
                        layer={layer}
                        cel={cel}
                    />
                )}
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
        const layer = state.layers.find(props.layer)
        const cel = state.cels.find(props.cel)

        return {
            layer,
            cel,
            active: layer.active()
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
        Operation.activateLayer(this.props.layer.pk)
    }

    handleNameChanged = ({ value }) =>
    {
        this.saveLayer(this.props.layer.set('name', value), 'Set Layer Name')
    }

    saveLayer (layer, description = 'Save Layer')
    {
        layerActions.save(layer)
        Operation.pushHistory(layer.fragment, description)
    }

    handleDelete = (e) =>
    {
        e.preventDefault()
        e.stopPropagation()
        Operation.deleteLayer(this.props.layer.pk)
        Operation.pushHistory(this.props.layer.fragment, 'Delete Layer')
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
                <Icon
                    tight
                    className='Layers-visibility'
                    name={this.props.layer.hidden ? 'eye-slash' : 'eye'}
                    onClick={this.handleVisibilityToggled}
                />
                <div className='Layers-preview'>
                    <Image checker className='Layers-image' data={this.props.cel.data} />
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
                    tight
                    className='Layers-delete'
                    name='trash'
                    onClick={this.handleDelete}
                />
            </div>
        )
    }
}
