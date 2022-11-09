import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'Pixie/Util/connect'
import { Image } from 'Pixie/Component/Image'
import { Icon } from 'Pixie/Component/Icon'
import { VISIBILITY } from 'Pixie/constants'
import { layerActions } from 'Pixie/Store/Action/applicationActions'
import { TextField } from 'Pixie/Component/Field'
import { Operation } from 'Pixie/Store/Operation'
import { withTab } from 'Pixie/Component/HOC/withTab'

export class Layers extends Component
{
    static Connected = withTab(connect(
        (state, props) =>
        {
            /**
             * @type {import('Pixie/Model/Application').Application}
             */
            const application = state.get('application')
            const tab = props.tab
            const fragment = tab.getFragment()
            const cels = fragment.getCels({ frame: tab.frame })

            return {
                fragment: fragment.pk,
                open: application.layers,
                cels,
                layerPos: tab.layer
            }
        },
        this
    ))

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
                <div className='Layers-drawer'>
                    {this.renderControls()}
                    <div className='Layers-body'>
                        {this.props.cels.reverse().map(
                            ({ layer, cel }) => <Layer.Connected
                                key={cel}
                                layer={layer}
                                cel={cel}
                                canDelete={this.props.cels.length > 1}
                            />
                        )}
                    </div>
                </div>
            </div>
        )
    }

    renderControls ()
    {
        return (
            <div className='Layers-controls'>
                <div className='Layers-title'>Layers</div>
                <div className='Layers-spacer'></div>
                <Icon
                    tight
                    className='Layers-control Layers-control--add'
                    name='plus-square'
                    onClick={this.handleLayerAdd}
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
        if (!this.props.canDelete) return
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
                    <TextField
                        invisible
                        autoSelectOnFocus
                        value={this.props.layer.name}
                        onCommit={this.handleNameChanged}
                    />
                </div>
                <Icon
                    tight
                    className={classNames(
                        'Layers-control',
                        {'Layers-control--disabled': !this.props.canDelete}
                    )}
                    name='trash'
                    onClick={this.handleDelete}
                />
            </div>
        )
    }
}
