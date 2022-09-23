import classNames from 'classnames'
import { ColorInput } from 'client/components/color-input'
import { Icon } from 'client/components/icon/icon'
import { Panel } from 'client/components/panel'
import { Mobile } from 'client/components/platform'
import { Slider } from 'client/components/slider'
import { Transition } from 'client/components/Transition'
import { TOOL_ERASER, TOOL_FILL, TOOL_PENCIL } from 'client/constants'
import { applicationSetBrushSize, applicationSetEraserSize, applicationSetPrimaryColor } from 'client/store/actions/applicationActions'
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
                color: application.primaryColor,
                canUndo: stack?.canUndo,
                canRedo: stack?.canRedo,
                pencilSize: application?.pencilSize,
                eraserSize: application?.eraserSize,
                tool: application?.tool
            }
        },
        this
    )

    handleUndo = () => undo(this.props.fragment)
    handleRedo = () => redo(this.props.fragment)

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
        switch (this.props.tool) {
            case TOOL_PENCIL:
                return this.renderPencilOptions()
            case TOOL_ERASER:
                return this.renderEraserOptions()
            case TOOL_FILL:
                return this.renderFillOptions()
        }
        return null
    }

    renderTimeline ()
    {
        if (!this.props.timeline) return null
        return <div className='BottomBar-timeline'>Timeline</div>
    }

    renderPrimaryColorOption ()
    {
        const color = this.props.color
        return (
            <div className='BottomBar-color'>
                <ColorInput
                    color={color}
                    onChange={applicationSetPrimaryColor}
                />
            </div>
        )
    }

    renderPencilSizeSlider ()
    {
        return (
            <div className='BottomBar-size'>
                <Slider
                    vertical
                    value={this.props.pencilSize}
                    min={1}
                    max={20}
                    transform={int}
                    onChange={applicationSetBrushSize}
                    renderLabel={this.renderLabel}
                />
            </div>
        )
    }

    renderEraserSizeSlider ()
    {
        return (
            <div className='BottomBar-size'>
                <Slider
                    vertical
                    value={this.props.eraserSize}
                    min={1}
                    max={20}
                    transform={int}
                    onChange={applicationSetEraserSize}
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

    renderPencilOptions ()
    {
        return <Panel
            key={this.props.tool}
            className='BottomBar-options'
        >
            {this.renderPrimaryColorOption()}
            {this.renderPencilSizeSlider()}
        </Panel>
    }

    renderEraserOptions ()
    {
        return <Panel
            key={this.props.tool}
            className='BottomBar-options'
        >
            {this.renderEraserSizeSlider()}
        </Panel>
    }

    renderFillOptions ()
    {
        return <Panel
            key={this.props.tool}
            className='BottomBar-options'
        >
            {this.renderPrimaryColorOption()}
        </Panel>
    }
}