import classNames from 'classnames'
import { Box } from 'Pixie/Component/Box'
import { Icon } from 'Pixie/Component/Icon'
import { Popover } from 'Pixie/Component/Popover'
import { createPassthroughComponent, getChildOfType, getChildrenOfType } from 'Pixie/Util/children'
import { def } from 'Pixie/Util/default'
import { Component } from 'react'

export class Dropdown extends Component
{
    static Item = ({ children, onClick, icon }) =>
    {
        return (
            <div
                className={classNames(
                    'Dropdown-item',
                    {
                        'Dropdown-item--clickable': !!onClick
                    }
                )}
                onClick={onClick}
            >
                {icon && <Icon tight className='Dropdown-icon' name={icon}/>}
                <div className='Dropdown-spacer'/>
                <div className='Dropdown-label'>{children}</div>
            </div>
        )
    }
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
                className='Dropdown'
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
            <div className='Dropdown-toggle' onClick={this.handleToggle}>
                {toggle && <div className='Dropdown-label'>{toggle}</div>}
                <Icon
                    tight
                    className='Dropdown-toggle'
                    name='ellipsis-vertical'
                />
            </div>
        )
    }

    renderItems ()
    {
        if (!this.state.open) return
        return (
            <Popover className="Dropdown-content" {...this.state.rect}>
                {getChildrenOfType(this.props.children, Dropdown.Item)}
            </Popover>
        )
    }

    /**
     *
     * @param {React.ReactNode} item
     * @param {Number} i
     */
    renderItem = (item, i) =>
    {
        const key = def(item.props.key, i)
        return (
            <div
                {...item.props}
                className='Dropdown-item'
                key={key}
            />
        )
    }
}
