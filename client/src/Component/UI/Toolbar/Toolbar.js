import { TOOL } from 'Pixie/constants'

import { Component } from 'react'
import { Panel } from 'Pixie/Component/Panel'
import { applicationTimelineToggle } from 'Pixie/store/actions/applicationActions'
import { activateTool } from 'Pixie/store/actions/toolboxActions'
import { connect } from 'Pixie/util/connect'
import { safeCall } from 'Pixie/util/safeCall'
import { ToolButton } from './ToolButton'

const KEY_BINDINGS = {
    b: () => activateTool(TOOL.PENCIL),
    e: () => activateTool(TOOL.ERASER),
    g: () => activateTool(TOOL.FILL),
    t: applicationTimelineToggle
}

export class Toolbar extends Component
{
    static Connected = connect(
        {
            'timeline': ['application', 'timeline']
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
        safeCall(tool)
    }

    render ()
    {
        return (
            <div className='Toolbar'>
                <Panel tight className='Toolbar-panel'>
                    <ToolButton.Connected tool={TOOL.PENCIL} />
                    <ToolButton.Connected tool={TOOL.ERASER} />
                    <ToolButton.Connected tool={TOOL.FILL} />
                    <ToolButton.Connected tool={TOOL.PAN} />
                    <ToolButton.Connected tool={TOOL.ZOOM} />
                </Panel>
                <Panel tight className='Toolbar-panel'>
                    <ToolButton.Connected
                        name='timeline'
                        icon='clock'
                        active={this.props.timeline}
                        onClick={applicationTimelineToggle}
                    />
                </Panel>
            </div>
        )
    }
}
