import { Icon } from 'Pixie/Component/Icon'
import { Popover } from 'Pixie/Component/Popover'
import { Transition } from 'Pixie/Component/Transition'
import { createPassthroughComponent, getChildOfType, getChildrenOfType } from 'Pixie/Util/children'
import { def } from 'Pixie/Util/default'
import { Component } from 'react'

export class Dropdown extends Component
{
    static Item = createPassthroughComponent()
    static Toggle = createPassthroughComponent()

    state = {
        open: false
    }

    stopPropagation = e => e.stopPropagation()

    handleToggle = () =>
    {
        if (this.state.open) return this.close()
        this.open()
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
            <div className='Dropdown' onClick={this.stopPropagation}>
                {this.renderToggle()}
                {this.renderItems()}
            </div>
        )
    }

    renderToggle ()
    {
        const toggle = getChildOfType(this.props.children, Dropdown.Toggle)
        return (
            <div className='Dropdown-toggle' onClick={this.handleToggle}>
                {toggle && <div className='Dropdown-label'>{toggle}</div>}
                <Icon tight name='ellipsis-vertical' />
            </div>
        )
    }

    renderItems ()
    {
        if (!this.state.open) return console.log('skipping children')
        console.log('rendering children')
        const items = getChildrenOfType(this.props.children, Dropdown.Item)
        return (
            <Popover>
                {items.map(this.renderItem)}
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
