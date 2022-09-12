import { TOOL_ERASER, TOOL_FILL, TOOL_MOVE, TOOL_PENCIL, TOOL_SELECT, TOOL_ZOOM } from 'client/constants'

import { Component } from 'react'
import { Icon } from 'client/components/icon/icon'
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
                { 'Toolbar-tool--active': this.active }
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
        [
            ['application', 'tool'],
            ['application', 'layers']
        ],
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
            </div>
        )
    }
}