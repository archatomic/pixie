import { applicationSetPrimaryColor, applicationSwapColors } from 'client/store/actions/applicationActions'

import { ColorInput } from './ColorInput'
import { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'client/util/connect'

import './ColorSelector.styl'

export class ColorSelector extends Component
{
    static Connected = connect({
        primary: ['application', 'primaryColor'],
        secondary: ['application', 'secondaryColor'],
    }, this)

    state = {
        picking: false
    }

    componentDidUpdate ({ primary, secondary })
    {
        // detect the color swap, and play the animation
        const colorsWereSwapped = (
            primary.pk === this.props.secondary.pk
            && secondary.pk === this.props.primary.pk
            && this.props.primary.pk !== this.props.secondary.pk
        )

        if (colorsWereSwapped && this.props.renderSecondary) this.playSwapAnimation()
    }

    playSwapAnimation ()
    {
        if (!this.el) return

        /** @type {HTMLElement} */
        const el = this.el
        el.classList.add('ColorSelector--flip')
        el.scrollTop // Triggers a render
        el.classList.remove('ColorSelector--flip')
    }

    handleRef = el => this.el = el

    render ()
    {
        return (
            <div className='ColorSelector' ref={this.handleRef}>
                {[
                    this.props.renderSecondary && this.renderColor(this.props.secondary, 'secondary', applicationSwapColors),
                    this.renderColor(this.props.primary, 'primary')
                ]}
            </div>
        )
    }

    renderColor (color, variant, onClick)
    {
        return (
            <div
                key={color.pk}
                className={classNames(
                    'ColorSelector-swatch',
                    { [`ColorSelector-swatch--${variant}`]: variant }
                )}
                onClick={ onClick }
            >
                <ColorInput key={color.pk} color={color} disabled={!!onClick} onChange={applicationSetPrimaryColor}/>
            </div>
        )
    }
}