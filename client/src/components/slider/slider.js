import classNames from 'classnames'
import { XYInput } from 'client/components/XYInput'
import { def } from 'client/util/default'
import { clamp } from 'client/util/math'
import { safeCall } from 'client/util/safeCall'
import { Component } from 'react'

export class Slider extends Component
{
    state = {
        open: false,
        value: this.normalize(def(this.props.value, 0)),
        denormalized: this.props.value,
    }

    get min ()
    {
        return def(this.props.min, 0)
    }

    get max ()
    {
        return def(this.props.max, 1)
    }

    get range ()
    {
        return this.max - this.min
    }

    componentDidUpdate (oldProps)
    {
        if (oldProps.value != this.props.value) {
            this.setState({
                value: this.normalize(def(this.props.value, 0)),
                denormalized: this.props.value
            })
        }
    }
    
    normalize (value)
    {
        return clamp((value - this.min) / this.range)
    }

    denormalize (value)
    {
        const denormalized = value * this.range + this.min
        if (this.props.transform) return this.props.transform(denormalized)
        return denormalized
    }

    handleStart = () => this.setState({ open: true })
    handleStop = () =>
    {
        this.setState({ open: false })
        safeCall(this.props.onChange, this.state.denormalized)
    }

    handleChange = e =>
    {
        const value = this.props.vertical ? 1 - e.y : e.x
        this.setState({
            value,
            denormalized: this.denormalize(value)
        })
    }

    getKnobStyles (value = this.state.value)
    {
        const prop = this.props.vertical ? 'bottom' : 'left'
        return { [prop]: `${value * 100}%` }
    }

    getIndicatorStyles ()
    {
        return this.getKnobStyles(this.normalize(this.props.value))
    }
    
    render ()
    {
        return (
            <XYInput
                className={classNames(
                    'Slider',
                    {
                        'Slider--open': this.state.open,
                        'Slider--horizontal': !this.props.vertical,
                        'Slider--vertical': this.props.vertical
                    }
                )}
                value={this.state.value}
                onInput={this.handleChange}
                onStart={this.handleStart}
                onStop={this.handleStop}
                selector='.Slider-track'
            >
                <div className='Slider-tooltip'>
                    <div className='Slider-tooltip-label' style={this.getKnobStyles()}>{this.state.denormalized}</div>
                </div>
                <div className='Slider-wrapper'>
                    <div className='Slider-label'>
                        {this.renderLabel()}
                    </div>
                    <div className='Slider-track'>
                        <div className='Slider-indicator' style={this.getIndicatorStyles()} />
                        <div className='Slider-knob' style={this.getKnobStyles()} />
                    </div>
                </div>
            </XYInput>
        )
    }
    
    renderLabel ()
    {
        if (this.props.renderLabel) return this.props.renderLabel(this.state)
        if (this.props.label) return this.props.label
        if (this.state.open) return this.state.denormalized
        return this.props.value
    }
}