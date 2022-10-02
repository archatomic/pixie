import './Timeline.styl'

import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { tabActions, fragmentActions } from 'client/store/actions/applicationActions'
import { Icon } from 'client/components/icon/icon'

/**
 * @typedef {import('client/model/PixieFragment').PixieFragment} PixieFragment
 * @typedef {import('client/model/PixieFrame').PixieFrame} PixieFrame
 * @typedef {import('client/model/PixieCel').PixieCel} PixieCel
 * @typedef {import('client/model/Application').Application} Application
 * @typedef {import('client/model/Tab').Tab} Tab
 */

/**
 * @typedef {object} TimelineProps
 * @property {PixieFragment} fragment
 * @property {Tab} tab
 */
export class Timeline extends Component
{
    static Connected = connect(
        state =>
        {
            /** @type {Application} */
            const application = state.get('application')
            const tab = application.getActiveTab()
            const fragment = application.getActiveFragment()

            return {
                tab,
                fragment
            }
        },
        this
    )

    handleFrameActivate = (event) =>
    {
        event.stopPropagation()
        
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
        return (
            <div className={classNames('Timeline', this.props.className, { 'Timeline--open': this.props.open })}>
                <TimelineLayer.Connected
                    tab={this.props.tab}
                    layer={this.props.tab.layer}
                    frame={this.props.tab.frame}
                    fragment={this.props.fragment}
                />
            </div>
        )
    }
}

class TimelineLayer extends Component
{
    /**
     * @extends
     */
    static Connected = connect(
        (state, props) =>
        {
            /**
             * @type {Application}
             */
            const application = state.get('application')
            const fragment = props.fragment
                ? application.fragments.find(props.fragment)
                : application.getActiveFragment()
            const layer = fragment.getLayer(props.layer)
            const frames = fragment.frames.toArray()
            return {
                layer,
                frames
            }
        },
        this
    )

    handleAddFrame = () =>
    {
        const framePos = this.props.fragment.frames.positionOf(this.props.frame)
        const newFramePos = framePos + 1
        const fragment = this.props.fragment.addFrame(newFramePos)
        fragmentActions.save(fragment, { history: 'Frame Added' })
        tabActions.save(this.props.tab.merge({ frame: newFramePos }))
    }

    render ()
    {
        return (
            <div className='Timeline-layer'>
                {this.props.frames.map((frame, i) => (
                    <TimelineFrame.Connected
                        key={frame.pk}
                        fragment={this.props.fragment}
                        frame={frame}
                        layer={this.props.layer}
                        tab={this.props.tab}
                        active={i === this.props.frame || frame.pk === this.props.frame} />
                ))}
                <div className='Timeline-layer-frame Timeline-layer-frame--button'>
                    <Icon name='plus' onClick={this.handleAddFrame}/>
                </div>
            </div>
        )
    }
}

class TimelineFrame extends Component
{
    static Connected = connect(
        (state, props) =>
        {
            /**
             * @type {Application}
             */
            const application = state.get('application')
            const fragment = props.fragment
                ? application.fragments.find(props.fragment)
                : application.getActiveFragment()
            const cel = fragment.getCel(props.layer, props.frame)
            return {
                cel
            }
        },
        this
    )

    handleClick = () =>
    {
        tabActions.save(this.props.tab.merge({
            frame: this.props.fragment.frames.positionOf(this.props.frame)
        }))
    }

    render ()
    {
        const empty = this.props.cel.inherited
        const active = this.props.active
        return (
            <div
                className={classNames(
                    'Timeline-layer-frame',
                    {
                        'Timeline-layer-frame--active': active,
                        'Timeline-layer-frame--empty': empty,
                    }
                )}
                onClick={this.handleClick}
            >
                <Icon name='circle' lined={empty}/>
            </div>
        )
    }
}
