import '@fortawesome/fontawesome-free/css/all.css'
import './icon.styl'

import { Component } from 'react'
import { Transition } from '../Transition'
import classNames from 'classnames'

/**
 * @typedef {object} IconProps
 * @prop {string} name
 * @prop {boolean} [button]
 * @prop {boolean} [tight]
 * @prop {boolean} [rotateLeft]
 * @prop {boolean} [disabled]
 * @prop {boolean} [active]
 * @prop {boolean} [subtle]
 */

/**
 * @type {Component<IconProps & import('react').HTMLProps>}
 */
export class Icon extends Component
{
    render ()
    {
        const {
            name,
            button,
            subtle,
            disabled,
            rotateLeft,
            active,
            className,
            tight,
            ...props
        } = this.props
        return (
            <Transition
                className={
                    classNames(
                        'Icon',
                        className,
                        `Icon--${name}`,
                        {
                            'Icon--subtle': subtle,
                            'Icon--button': button,
                            'Icon--disabled': disabled,
                            'Icon--rotateLeft': rotateLeft,
                            'Icon--tight': tight,
                            'Icon--active': active
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