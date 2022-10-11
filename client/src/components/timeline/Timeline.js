import './Timeline.styl'

import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { tabActions, fragmentActions, frameActions } from 'client/store/actions/applicationActions'
import { Icon } from 'client/components/icon/icon'
import { NumberField } from 'client/components/field/Number'
import { Operation } from 'client/store/operations'

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
        (state, props) =>
        {
            return {
                tab: state.getTab(props.tab)
            }
        },
        this
    )

    render ()
    {
        return (
            <div className={classNames('Timeline', this.props.className, { 'Timeline--open': this.props.open })}>
                <TimelineControls.Connected tab={this.props.tab} />
                <TimelineLayer.Connected tab={this.props.tab} />
            </div>
        )
    }
}

class TimelineControls extends Component
{
    static Connected = connect((state, props) =>
    {
        const tab = state.getTab(props.tab)
        const fragment = state.fragments.find(tab.fragment)
        const frame = state.frames.find(tab.frame)

        return {
            position: frame.position(),
            numFrames: fragment.frames.count(),
            frame
        }
    }, this)

    get canDeleteFrame ()
    {
        return this.props.numFrames > 1
    }

    handleBack = () =>
    {
        this.setFrame(this.props.position - 1)
    }

    handleForward = () =>
    {
        this.setFrame(this.props.position + 1)
    }

    handleReset = () =>
    {
        this.setFrame(0)
    }

    handleDeleteFrame = () =>
    {
        if (!this.canDeleteFrame) return
        Operation.deleteFrame(this.props.frame.pk)
    }

    handleDurationChanged = ({value}) =>
    {
        frameActions.save(
            this.props.frame.set('duration', value),
            { history: 'Set Duration' }
        )
    }

    handleFPSChanged = ({value}) =>
    {
        frameActions.save(
            this.props.frame.setFps(value),
            { history: 'Set FPS' }
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
                {this.renderTimelineInfo()}
            </div>
        )
    }
    
    renderTimelineInfo ()
    {
        if (this.props.frame.null) return null
        return (
            <div className='Timeline-info' key={this.props.frame.pk}>
                <div className='Timeline-frame-number'>Frame {this.props.position + 1}</div>
                <NumberField
                    className='Timeline-duration'
                    inline
                    tight
                    autoSelectOnFocus
                    precision={4}
                    min={0.0001}
                    max={10}
                    label='Duration'
                    value={this.props.frame.duration}
                    onChange={this.handleDurationChanged}
                />
                <NumberField
                    className='Timeline-duration'
                    inline
                    tight
                    autoSelectOnFocus
                    precision={4}
                    min={0.1}
                    max={10000}
                    label='FPS'
                    value={this.props.frame.fps}
                    onChange={this.handleFPSChanged}
                />
                <Icon name='trash' disabled={!this.canDeleteFrame} onClick={this.handleDeleteFrame}/>
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
            const tab = state.getTab(props.tab)
            const fragment = state.fragments.find(tab.fragment)
            return {
                tab,
                cels: fragment.getCels({ layer: tab.layer })
            }
        },
        this
    )

    handleAddFrame = () =>
    {
        Operation.addFrameToFragment(this.props.tab.fragment)
    }

    render ()
    {
        return (
            <div className='Timeline-layer'>
                {this.props.cels.map(({ frame }) => (
                    <TimelineFrame.Connected key={frame} frame={frame} />
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
            const frame = state.frames.find(props.frame)
            return {
                frame,
                active: frame.active()
            }
        },
        this
    )

    handleClick = () =>
    {
        Operation.activateFrame(this.props.frame.pk)
    }

    render ()
    {
        const empty = false
        return (
            <div
                className={classNames(
                    'Timeline-layer-frame',
                    {
                        'Timeline-layer-frame--active': this.props.active,
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
