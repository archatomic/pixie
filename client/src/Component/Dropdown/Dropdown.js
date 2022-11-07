import classNames from 'classnames'
import { Box } from 'Pixie/Component/Box'
import { Icon } from 'Pixie/Component/Icon'
import { Popover } from 'Pixie/Component/Popover'
import { IS_MOBILE } from 'Pixie/constants'
import { createPassthroughComponent, getChildOfType, getChildrenOfType } from 'Pixie/Util/children'
import { go } from 'Pixie/Util/navigate'
import { useMemo } from 'react'
import { Component } from 'react'

export class Dropdown extends Component
{
    static Item = ({ children, onClick, to, disabled, icon }) =>
    {
        const cb = useMemo(() => () => go(to), [to])
        if (disabled) onClick = undefined
        if (to) onClick = cb
        return (
            <div
                className={classNames(
                    'Dropdown-item',
                    {
                        'Dropdown-item--clickable': !!onClick,
                        'Dropdown-item--disabled': disabled,
                    }
                )}
                onClick={onClick}
            >
                <div className='Dropdown-label'>{children}</div>
                <div className='Dropdown-spacer'/>
                {icon && <Icon tight className='Dropdown-icon' name={icon}/>}
            </div>
        )
    }
    static Divider = () => <hr className='Dropdown-divider' />
    static Toggle = createPassthroughComponent()

    state = {
        open: false,
        rect: null
    }

    stopPropagation = e => e.stopPropagation()

    handleToggle = () =>
    {
        if (this.state.open) return this.close()
        this.open()
    }

    handleResize = (e) =>
    {
        this.setState({ rect: e.value })
    }

    open ()
    {
        this.setState({ open: true })
        document.addEventListener('click', this.close)
    }

    close = () =>
    {
        document.removeEventListener('click', this.close)
        this.setState({ open: false })
    }

    render ()
    {
        return (
            <Box
                className={classNames(
                    'Dropdown',
                    this.props.className,
                )}
                onClick={this.stopPropagation}
                onResize={this.handleResize}
            >
                {this.renderToggle()}
                {this.renderItems()}
            </Box>
        )
    }

    renderToggle ()
    {
        const toggle = getChildOfType(this.props.children, Dropdown.Toggle)
        return (
            <div
                className={classNames(
                    'Dropdown-toggle',
                    toggle?.props?.className
                )}
                onClick={this.handleToggle}
            >
                {toggle?.props?.children && <div className='Dropdown-label'>{toggle.props.children}</div>}
                <Icon
                    tight
                    className='Dropdown-toggle-button'
                    name='ellipsis-vertical'
                />
            </div>
        )
    }

    renderItems ()
    {
        if (!this.state.open) return
        if (IS_MOBILE) return this.renderMobileItems()
        return this.renderDesktopItems()
    }

    renderDesktopItems ()
    {
        return (
            <Popover
                className="Dropdown-content"
                {...this.state.rect}
                onClick={this.close}
            >
                {getChildrenOfType(
                    this.props.children,
                    [Dropdown.Item, Dropdown.Divider]
                )}
            </Popover>
        )
    }

    renderMobileItems ()
    {
        return (
            <Popover
                className="Dropdown-content Dropdown-content--mobile"
                onShadeClick={this.close}
                onClick={this.close}
                x={0}
                y={0}
                width={window.innerWidth}
                height={window.innerHeight}
                shade
                vAlign='bottom'
                align='center'
            >
                {getChildrenOfType(
                    this.props.children,
                    [Dropdown.Item, Dropdown.Divider]
                )}
            </Popover>
        )
    }
}
