import classNames from 'classnames'
import { ColorInput } from 'client/components/color-input'
import { Icon } from 'client/components/icon'
import { Panel } from 'client/components/panel'
import { Mobile } from 'client/components/platform'
import { Slider } from 'client/components/slider'
import { Timeline } from 'client/components/timeline/Timeline'
import { Transition } from 'client/components/Transition'
import { Color } from 'client/model/Color'
import { setToolOption } from 'client/store/actions/toolboxActions'
import { redo, undo } from 'client/store/actions/undoActions'
import { connect } from 'client/util/connect'
import { int } from 'client/util/math'
import { Component } from 'react'

export class BottomBar extends Component
{
    static Connected = connect(
        (state) =>
        {
            const application = state.get('application')
            const fragment = application?.getActiveFragment()
            const stack = fragment ? application?.undoManager?.getStack(fragment) : null
            return {
                fragment,
                timeline: application.timeline,
                canUndo: stack?.canUndo,
                canRedo: stack?.canRedo,
                tool: application?.toolbox?.tool
            }
        },
        this
    )

    handleUndo = (e) => undo (this.props.fragment)
    handleRedo = () => redo(this.props.fragment)
    handleOptionChanged = ({ name, value }) => setToolOption(name, value)

    render ()
    {
        return (
            <div className={classNames('BottomBar', { 'BottomBar--timeline': this.props.timeline })}>
                <div className='BottomBar-overlay'>
                    <Mobile>
                        <div
                            className={classNames('BottomBar-undo', { 'BottomBar-undo--disabled': !this.props.canUndo })}
                            onClick={this.handleUndo}
                        >
                            <Icon name='undo' />
                        </div>
                    </Mobile>
                    <Transition>
                        {this.renderToolOptions()}
                    </Transition>
                    <Mobile>
                        <div
                            className={classNames('BottomBar-redo', { 'BottomBar-redo--disabled': !this.props.canRedo })}
                            onClick={this.handleRedo}
                        >
                            <Icon name='redo' />
                        </div>
                    </Mobile>
                </div>
                <Transition className='BottomBar-timeline-wrapper'>
                    {this.renderTimeline()}
                </Transition>
            </div>
        )
    }

    renderToolOptions ()
    {
        if (!this.props.tool.options.length) return null
        
        return (
            <Panel key={this.props.tool.name} className='BottomBar-options'>
                {this.props.tool.options.map (option => this.renderToolOption(option))}
            </Panel>
        )
    }

    renderToolOption (option)
    {
        if (option.value instanceof Color)
            return this.renderColorPicker(option.id, option.value)
        
        if (typeof option.value === 'number')
            return this.renderSlider(option.id, option.value)
    }

    renderTimeline ()
    {
        if (!this.props.timeline) return null
        return (
            <div className='BottomBar-timeline'>
                <Timeline.Connected/>
            </div>
        )
    }

    renderColorPicker (name, color = Color.Black)
    {
        return (
            <div key={name} className='BottomBar-color'>
                <ColorInput
                    name={name}
                    color={color}
                    onChange={this.handleOptionChanged}
                />
            </div>
        )
    }

    renderSlider (name, value = 1)
    {
        return (
            <div key={name} className='BottomBar-size'>
                <Slider
                    vertical
                    name={name}
                    value={value}
                    min={1}
                    max={20}
                    transform={int}
                    onChange={this.handleOptionChanged}
                    renderLabel={this.renderLabel}
                />
            </div>
        )
    }

    renderLabel ({ denormalized })
    {
        const size = `${denormalized / 10}rem`
        return <div
            className='BottomBar-brush-size'
            style={{
                width: size,
                height: size
            }}
        />
    }
}