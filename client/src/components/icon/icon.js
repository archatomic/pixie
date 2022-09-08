import '@fortawesome/fontawesome-free/css/all.css'
import './icon.styl'

import { Component } from 'react'
import { Transition } from '../Transition'
import classNames from 'classnames'

/**
 * @typedef {object} IconProps
 * @prop {string} name
 * @prop {boolean} [button]
 */

/**
 * @type {Component<IconProps & import('react').HTMLProps>}
 */
export class Icon extends Component
{
    render ()
    {
        const { name, button, className, ...props } = this.props
        return (
            <Transition className={classNames('Icon', `Icon--${name}`, {'Icon--button': this.props.button})} {...props}>
                <i key={name} className={`Icon-glyph fa fa-${name}`} />
            </Transition>
        )
    }
}