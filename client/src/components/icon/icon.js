import '@fortawesome/fontawesome-free/css/all.css'
import './icon.styl'

import { Component } from '../Component'
import { Transition } from '../Transition'

/**
 * @typedef {object} IconProps
 * @prop {string} name
 * @prop {boolean} button
 */

/**
 * @type {Component<IconProps & import('react').HTMLProps>}
 */
export class Icon extends Component
{
    bemBlock () { return 'Icon' }
    
    bemVariants ()
    {
        return [
            'button',
            {
                name: this.props.name
            }
        ]
    }

    render ()
    {
        const { name, button, className, ...props } = this.props
        return (
            <Transition className={this.className} {...props}>
                <i key={name} className={this.bemElement('glyph', 'fa', `fa-${name}`)} />
            </Transition>
        )
    }
}