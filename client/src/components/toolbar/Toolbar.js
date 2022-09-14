import { TOOL_ERASER, TOOL_FILL, TOOL_MOVE, TOOL_PENCIL, TOOL_SELECT, TOOL_ZOOM } from 'client/constants'
import { redo, undo } from 'client/store/actions/undoActions'

import { Component } from 'react'
import { Icon } from 'client/components/icon/icon'
import { Mobile } from '../platform'
import { Panel } from '../panel'
import { applicationToolSet } from 'client/store/actions/applicationActions'
import classNames from 'classnames'
import { connect } from 'client/util/connect'
import { def } from 'client/util/default'
import { go } from 'client/util/navigate'

export class Tool extends Component
{
    static Connected = connect({ 'activeTool': ['application', 'tool'] }, this)

    get active ()
    {
        return this.props.activeTool === this.props.tool
    }

    handleClick = () =>
    {
        if (this.props.to) return go(this.props.to)
        if (this.props.onClick) return this.props.onClick()
        if (this.props.tool) return applicationToolSet(this.props.tool)
    }

    render ()
    {
        const icon = def(this.props.icon, this.props.tool)
        const tool = def(this.props.tool, this.props.icon)
        return (
            <div className={classNames(
                'Toolbar-tool',
                this.props.className,
                `Toolbar-tool--${tool}`,
                { 'Toolbar-tool--active': this.active, 'Toolbar-tool--disabled': this.props.disabled }
            )}>
                <Icon name={icon} onClick={this.handleClick} {...this.props.iconProps}/>
            </div>
        )

    }
}

const KEY_BINDINGS = {
    b: TOOL_PENCIL,
    e: TOOL_ERASER,
    g: TOOL_FILL
}

export class Toolbar extends Component
{
    static Connected = connect(
        (state) =>
        {
            const application = state.get('application')
            const fragment = application?.getActiveFragment()
            const stack = fragment ? application?.undoManager?.getStack(fragment) : null
            return {
                fragment,
                canUndo: stack?.canUndo,
                canRedo: stack?.canRedo,
            }
        },
        this
    )

    componentDidMount ()
    {
        window.addEventListener('keydown', this.handleKeyDown)
    }

    componentWillUnmount ()
    {
        window.removeEventListener('keydown', this.handleKeyDown)
    }

    handleKeyDown = (e) =>
    {
        const tool = KEY_BINDINGS[e.key]
        if (tool) applicationToolSet(tool)
    }

    handleUndo = () =>
    {
        if (this.props.fragment) undo(this.props.fragment)
    }

    handleRedo = () =>
    {
        if (this.props.fragment) redo(this.props.fragment)
    }

    render ()
    {
        return (
            <div className={classNames('Toolbar', this.props.className)}>
                <Tool.Connected name='home' icon='bolt' to='/' />
                <div className='Toolbar-spacer' />
                <Panel tight>
                    <Tool.Connected tool={TOOL_PENCIL} />
                    <Tool.Connected tool={TOOL_ERASER} />
                    <Tool.Connected tool={TOOL_FILL} icon='fill-drip'/>
                    {/*<Tool.Connected tool={TOOL_MOVE} icon='arrows-up-down-left-right'/>
                    <Tool.Connected tool={TOOL_SELECT} icon='square' />*/}
                </Panel>
                <Mobile>
                    <div className='Toolbar-undo'>
                        <Tool.Connected name='undo' icon='undo' onClick={this.handleUndo} disabled={!this.props.canUndo}/>
                        <Tool.Connected name='redo' icon='redo' onClick={this.handleRedo} disabled={!this.props.canRedo}/>
                    </div>
                </Mobile>
            </div>
        )
    }
}