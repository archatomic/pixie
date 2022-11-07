import classNames from 'classnames'
import { Component } from 'react'
import { NavLink } from 'react-router-dom'

/**
 * @extends {NavLink}
 */
export class Link extends Component
{
    render ()
    {
        const { className, activeClassName, ...passThroughProps } = this.props
        return <NavLink
            className={({ isActive }) => classNames(
                'Link',
                className,
                isActive && 'Link--active',
                isActive && activeClassName
            )}
            {...passThroughProps}
        />
    }
}
