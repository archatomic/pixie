import '@fortawesome/fontawesome-free/css/all.css'

import { Component } from 'react'
import { Transition } from '../Transition'
import classNames from 'classnames'
import { icons } from 'Pixie/Component/Icon/SVG'

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
    get faClassName ()
    {
        return [
            'fa',
            this.props.lined ? 'fa-regular' : 'fa-solid',
            `fa-${this.props.name}`
        ]
    }

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
            lined,
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
                            'Icon--active': active,
                            'Icon--lined': lined
                        }
                    )
                }
                {...props}
            >
                {this.renderGlyph(name)}
            </Transition>
        )
    }

    renderGlyph (name)
    {
        if (icons[name]) return this.renderSVGglyph(name)
        return this.renderFontAwesomeGlyph(name)
    }

    renderSVGglyph (name)
    {
        const Glyph = icons[name]
        return <Glyph
            {...this.props.iconProps}
            key={name}
            className='Icon-glyph'
            tight={this.props.tight}
        />
    }

    renderFontAwesomeGlyph (name)
    {
        return <i {...this.props.iconProps} key={name} className={classNames('Icon-glyph', this.faClassName)} />
    }
}
