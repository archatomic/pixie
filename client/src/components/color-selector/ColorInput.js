import './ColorInput.styl'

import { Color } from 'client/model/Color'
import { Component } from 'react'
import { Icon } from 'client/components/icon/icon'
import { Transition } from 'client/components/Transition'
import { clamp } from 'client/util/math'
import classNames from 'classnames'
import { def } from 'client/util/default'
import { safeCall } from 'client/util/safeCall'

class XYInput extends Component
{
    handlePointerDown = (e) =>
    {
        e.currentTarget.setPointerCapture(e.pointerId)
        this.handlePointerMove(e)
        e.currentTarget.addEventListener('pointermove', this.handlePointerMove)
    }

    handlePointerMove = (e) =>
    {
        const rect = e.currentTarget.getBoundingClientRect()
        safeCall(this.props.onInput, {
            x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
            y: clamp((e.clientY - rect.top) / rect.height, 0, 1)
        })
    }

    handlePointerUp = (e) =>
    {
        e.currentTarget.removeEventListener('pointermove', this.handlePointerMove)
        this.handlePointerMove(e)
    }

    render ()
    {
        const { onInput, ...props } = this.props
        return <div
            {...props}
            onPointerDown={this.handlePointerDown}
            onPointerUp={this.handlePointerUp}
        />
    }
}

export class ColorInput extends Component
{
    state = this.getInitialState()

    getInitialState ()
    {
        const initial = this.color

        return {
            expanded: false,
            initial,
            current: initial,
        }
    }

    hasColor ()
    {
        if (this.props.color instanceof Color === false) return false
        return !this.props.color.null
    }

    get color ()
    {
        return def(this.props.color, Color.Black)
    }

    componentDidUpdate ()
    {
        if (this.state.expanded && !this.isOpen()) {
            this.handleCancel()
        }
    }

    handleCommit = () =>
    {
        this.setState({
            expanded: false,
            initial: this.state.current
        })

        safeCall(this.props.onChange, this.state.current)
    }

    handleCancel = () =>
    {
        this.setState({
            expanded: false,
            current: this.state.initial
        })
    }

    handleOpen = () =>
    {
        this.setState({
            expanded: true,
            initial: this.color,
            current: this.color,
            ...this.color.getHSL()
        })
    }

    handleHue = ({x, y}) =>
    {
        const h = 180 - Math.atan2(x - 0.5, y - 0.5) * 180 / Math.PI
        this.setState({
            h,
            current: this.state.current.setHSL(h, this.state.s, this.state.l)
        })
    }

    handleSatVal = ({ x, y }) =>
    {
        y = 1 - y
        this.setState({
            s: x,
            l: y,
            current: this.state.current.setHSL(this.state.h, x, y)
        })
    }

    isOpen ()
    {
        if (this.props.disabled) return false
        return this.state.expanded
    }

    _handlers = {}

    getChannelHandler (channel)
    {
        if (!this._handlers[channel]) {
            this._handlers[channel] = this.handleChannelInput.bind(this, channel)
        }
        return this._handlers[channel]
    }

    handleChannelInput (channel, event)
    {
        const current = this.state.current.set(channel, event.x)
        this.setState({
            current,
            ...current.getHSL()
        })
    }

    render ()
    {
        return (
            <div className={classNames('ColorInput', { 'ColorInput--expanded': this.isOpen() })}>
                <Transition>
                    {this.isOpen() ? this.renderControl() : this.renderToggle()}
                </Transition>
            </div>
        )
    }

    renderToggle ()
    {
        const style = { '--color': this.color.getCSS() }
        const onClick = this.props.disabled ? undefined : this.handleOpen
        return (
            <div key='toggle' className='ColorInput-toggle' style={style} onClick={onClick}/>
        )
    }

    renderControl ()
    {
        return (
            <div className='ColorInput-control' key='control'>
                <Icon
                    className={classNames(
                        'ColorInput-close',
                        {
                            'ColorInput-close--bright': this.state.initial.isBright(),
                            'ColorInput-close--transparent': this.state.initial.a < 0.5,
                        }
                    )}
                    name='close'
                    onClick={this.handleCancel}
                />
                <Icon 
                    className={classNames(
                        'ColorInput-commit',
                        {
                            'ColorInput-commit--bright': this.state.current.isBright(),
                            'ColorInput-close--transparent': this.state.current.a < 0.5,
                        }
                    )}
                    name='check'
                    onClick={this.handleCommit}
                />
                <div className='ColorInput-heading'>
                    <div className='ColorInput-initial' style={{ backgroundColor: this.state.initial.getCSS() }}/>
                    <div className='ColorInput-current' style={{ backgroundColor: this.state.current.getCSS() }}/>
                </div>
                {this.renderHSL()}
                <div className='ColorInput-rgb'>
                    {this.renderChannel('r')}
                    {this.renderChannel('g')}
                    {this.renderChannel('b')}
                    {this.renderChannel('a')}
                </div>
            </div>
        )
    }

    renderHSL ()
    {
        const satValStyle = { backgroundColor: `hsl(${this.state.h}deg 100% 50%)` }
        const hueKnobStyle = { transform: `rotate(${this.state.h}deg)` }
        const satValKnobStyle = {
            left: `${this.state.s * 100}%`,
            bottom: `${this.state.l * 100}%`
        }

        return (
            <div className='ColorInput-hsl'>
                <XYInput className='ColorInput-hue' onInput={this.handleHue}>
                    <div className='ColorInput-knob ColorInput-knob--hue' style={hueKnobStyle}/>
                </XYInput>
                <XYInput className='ColorInput-satval' onInput={this.handleSatVal} style={satValStyle}>
                    <div className='ColorInput-knob ColorInput-knob--satval' style={satValKnobStyle}/>
                </XYInput>
            </div>
        )
    }

    renderChannel (c)
    {
        const background = this.state.current.set(c, 0)
        const channel = this.state.current.getChannel(c)
        const knobPos = `${channel * 100 / 255}%`

        const trackStyle = c === 'a' ? {} : {
            backgroundColor: background.getCSS({ a: 1 }),
            backgroundImage: `linear-gradient(to right, black, ${Color.Black.set(c, 1).getCSS()})`
        }

        const knobStyle = {
            backgroundColor: c === 'a' ? `white` : this.state.current.getCSS({ a: 1 }),
            left: knobPos,
        }

        return (
            <div className={classNames('ColorInput-channel', `ColorInput-channel--${c}`)}>
                <div className='ColorInput-label'>{c.toUpperCase()}</div>
                <XYInput className='ColorInput-track' style={trackStyle} onInput={this.getChannelHandler(c)}>
                    <div className='ColorInput-knob' style={knobStyle}></div>
                </XYInput>
                <div className='ColorInput-input'>{channel}</div>
            </div>
        )
    }
}