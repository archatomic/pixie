import './Timeline.styl'

import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { tabActions, fragmentActions } from 'client/store/actions/applicationActions'
import { Icon } from 'client/components/icon/icon'
import { Text } from 'client/components/field/Text'

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

    render ()
    {
        // TODO: Move timeline controls into their own thing
        return (
            <div className={classNames('Timeline', this.props.className, { 'Timeline--open': this.props.open })}>
                <TimelineControls.Connected
                    fragment={this.props.fragment}
                    tab={this.props.tab}
                    frame={this.props.tab.frame}
                />
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

class TimelineControls extends Component
{
    static Connected = connect((state, props) =>
    {
        /** @type {Application} */
        const application = state.get('application')
        const fragment = props.fragment || application.getActiveFragment()
        const frame = fragment.frames.find(props.frame)

        return {
            position: fragment.frames.positionOf(frame) + 1,
            numFrames: fragment.frames.length,
            frame
        }
    }, this)

    get canDeleteFrame ()
    {
        return this.props.numFrames > 1
    }

    handleBack = () =>
    {
        this.setFrame(this.props.position - 2)
    }

    handleForward = () =>
    {
        this.setFrame(this.props.position)
    }

    handleReset = () =>
    {
        this.setFrame(0)
    }

    handleDeleteFrame = () =>
    {
        if (!this.canDeleteFrame) return
        fragmentActions.save(
            this.props.fragment.deleteFrame(this.props.frame),
            { history: 'Delete Frame' }
        )
    }

    setFrame (frame)
    {
        if (frame < 0) frame = this.props.numFrames - 1
        if (frame >= this.props.numFrames) frame = 0
        tabActions.save(this.props.tab.set('frame', frame))
    }

    render ()
    {
        return (
            <div className='Timeline-controls'>
                <Icon className='Timeline-control' tight name='backward-fast' onClick={ this.handleReset }/>
                <Icon className='Timeline-control' tight name='backward-step' onClick={ this.handleBack }/>
                <Icon className='Timeline-control' tight name='play'/>
                <Icon className='Timeline-control' tight name='forward-step' onClick={ this.handleForward }/>
                <div className='Timeline-info'>
                    <div className='Timeline-frame-number'>{this.props.position}</div>
                    <Text label='Duration' tight value={this.props.frame.duration}/>
                    <Icon name='trash' disabled={!this.canDeleteFrame} onClick={this.handleDeleteFrame}/>
                </div>
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
