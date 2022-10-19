import { TOOL } from 'Pixie/constants'

import { Component } from 'react'
import { Icon } from 'Pixie/Component/icon'
import { Panel } from 'Pixie/Component/panel'
import { applicationTimelineToggle } from 'Pixie/store/actions/applicationActions'
import { activateTool } from 'Pixie/store/actions/toolboxActions'
import classNames from 'classnames'
import { connect } from 'Pixie/util/connect'
import { def, isDefined } from 'Pixie/util/default'
import { go } from 'Pixie/util/navigate'
import { warn } from 'Pixie/util/log'
import { safeCall } from 'Pixie/util/safeCall'

export class Tool extends Component
{
    static Connected = connect({
        'activeTool': ['application', 'toolbox', 'active'],
        'toolRecord': (state, props) => state.getIn(['application', 'toolbox']).getTool(props.tool)
    }, this)

    get active ()
    {
        return def(this.props.active, this.props.activeTool === this.props.tool)
    }

    handleClick = () =>
    {
        if (this.props.to) return go(this.props.to)
        if (this.props.onClick) return this.props.onClick()
        if (isDefined(this.props.toolRecord)) return activateTool(this.props.tool)
    }

    render ()
    {
        const icon = def(this.props.icon, this.props.toolRecord.icon)
        const toolName = def(this.props.name, this.props.toolRecord.name)

        if (!icon) return warn(`Refusing to render an unrenderable tool. NAME="${toolName}", ID="${this.props.tool}"`)

        return (
            <div className={classNames(
                'Toolbar-tool',
                this.props.className,
                `Toolbar-tool--${toolName}`
            )}>
                <Icon
                    subtle
                    active={this.active}
                    disabled={this.props.disabled}
                    name={icon}
                    onClick={this.handleClick}
                    {...this.props.iconProps}
                />
            </div>
        )

    }
}

const KEY_BINDINGS = {
    b: () => activateTool(TOOL.PENCIL),
    e: () => activateTool(TOOL.ERASER),
    g: () => activateTool(TOOL.FILL),
    t: applicationTimelineToggle
}

export class Toolbar extends Component
{
    static Connected = connect({ 'timeline': ['application', 'timeline'] }, this)

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
        safeCall(tool)
    }

    render ()
    {
        return (
            <div className='Toolbar'>
                <Panel tight className='Toolbar-panel'>
                    <Tool.Connected tool={TOOL.PENCIL}/>
                    <Tool.Connected tool={TOOL.ERASER}/>
                    <Tool.Connected tool={TOOL.FILL}/>
                    <Tool.Connected tool={TOOL.PAN}/>
                    <Tool.Connected tool={TOOL.ZOOM}/>
                    {/*<Tool.Connected tool={TOOL.cMOVE} icon='arrows-up-down-left-right'/>
                    <Tool.Connected tool={TOOL.SELECT} icon='square' />*/}
                </Panel>
                <Panel tight className='Toolbar-panel'>
                    <Tool.Connected active={this.props.timeline} name='timeline' icon='clock' onClick={applicationTimelineToggle}/>
                </Panel>
            </div>
        )
    }
}