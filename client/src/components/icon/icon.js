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
        const { name, button, rotateLeft, className, ...props } = this.props
        return (
            <Transition
                className={
                    classNames(
                        'Icon',
                        className,
                        `Icon--${name}`,
                        {
                            'Icon--button': button,
                            'Icon--rotateLeft': rotateLeft
                        }
                    )
                }
                {...props}
            >
                <i key={name} className={`Icon-glyph fa fa-${name}`} />
            </Transition>
        )
    }
}