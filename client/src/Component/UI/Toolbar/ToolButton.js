import classNames from 'classnames'
import { Icon } from 'Pixie/Component/Icon'
import { activateTool } from 'Pixie/Store/Action/toolboxActions'
import { connect } from 'Pixie/Util/connect'
import { def, isDefined } from 'Pixie/Util/default'
import { warn } from 'Pixie/Util/log'
import { go } from 'Pixie/Util/navigate'
import { Component } from 'react'

export class ToolButton extends Component
{
    static Connected = connect(
        {
            'activeTool': ['application', 'toolbox', 'active'],
            'toolRecord': (state, props) => state.getIn(['application', 'toolbox']).getTool(props.tool)
        },
        this
    )

    get active ()
    {
        return def(this.props.active, this.props.activeTool === this.props.tool)
    }

    handleClick = () =>
    {
        if (this.props.to) return go(this.props.to)
        if (this.props.onClick) return this.props.onClick()
        if (isDefined(this.props.toolRecord)) {
            return activateTool(this.props.tool)
        }
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
