import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'Pixie/Util/connect'
import { tabActions, frameActions } from 'Pixie/Store/Action/applicationActions'
import { Icon } from 'Pixie/Component/Icon'
import { NumberField } from 'Pixie/Component/Field'
import { Operation } from 'Pixie/Store/Operation'
import { MAX_FPS, MAX_FRAME_DURATION, MIN_FPS, MIN_FRAME_DURATION } from 'Pixie/constants'

/**
 * @typedef {import('Pixie/Model/PixieFragment').PixieFragment} PixieFragment
 * @typedef {import('Pixie/Model/PixieFrame').PixieFrame} PixieFrame
 * @typedef {import('Pixie/Model/PixieCel').PixieCel} PixieCel
 * @typedef {import('Pixie/Model/Application').Application} Application
 * @typedef {import('Pixie/Model/Tab').Tab} Tab
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
        Operation.pushHistory(this.props.frame.fragment, 'Delete Frame')
    }

    handleDurationChanged = ({ value }) =>
    {
        frameActions.save(this.props.frame.set('duration', value))
        Operation.pushHistory(this.props.frame.fragment, 'Set Frame Duration')
    }

    handleFPSChanged = ({ value }) =>
    {
        frameActions.save(this.props.frame.setFps(value))
        Operation.pushHistory(this.props.frame.fragment, 'Set Frame FPS')
    }

    handlePlayPause = () =>
    {
        tabActions.save(this.props.tab.set('play', !this.props.tab.play))
    }

    handleOnionSkin = () =>
    {
        tabActions.save(this.props.tab.setOnionSkin(this.props.tab.onionSkin ? 0 : 1))
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
                <div className='Timeline-playback'>
                    <Icon className='Timeline-control' tight name='backward-fast' onClick={this.handleReset} />
                    <Icon className='Timeline-control' tight name='backward-step' onClick={this.handleBack} />
                    <Icon className='Timeline-control' tight name={this.props.tab.play ? 'pause' : 'play'} onClick={this.handlePlayPause} />
                    <Icon className='Timeline-control' tight name='forward-step' onClick={this.handleForward} />
                    <Icon className='Timeline-control' tight name='onion' onClick={this.handleOnionSkin} active={this.props.tab.onionSkin > 0} />
                </div>
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
                    min={MIN_FRAME_DURATION}
                    max={MAX_FRAME_DURATION}
                    label='Duration'
                    value={this.props.frame.duration}
                    onChange={this.handleDurationChanged}
                />
                <NumberField
                    className='Timeline-fps'
                    inline
                    tight
                    autoSelectOnFocus
                    precision={4}
                    min={MIN_FPS}
                    max={MAX_FPS}
                    label='FPS'
                    value={this.props.frame.fps}
                    onChange={this.handleFPSChanged}
                />
                <div className='Timeline-spacer'></div>
                <Icon name='trash' disabled={!this.canDeleteFrame} onClick={this.handleDeleteFrame} />
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
        Operation.pushHistory(this.props.tab.fragment, 'Add Frame')
    }

    render ()
    {
        return (
            <div className='Timeline-layer'>
                {this.props.cels.map(({ frame }) => (
                    <TimelineFrame.Connected key={frame} frame={frame} />
                ))}
                <div className='Timeline-layer-frame Timeline-layer-frame--button'>
                    <Icon name='plus' onClick={this.handleAddFrame} />
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
                <Icon name='circle' lined={empty} />
            </div>
        )
    }
}
