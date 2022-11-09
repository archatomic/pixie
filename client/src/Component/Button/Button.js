import { Component } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

/**
 * @typedef {object} ButtonProps
 * @property {string} [label]
 * @property {import('react').ReactNode} [children]
 * @property {boolean} [submit]
 * @property {string} [to]
 * @property {boolean} [disabled]
 * @property {boolean} [full]
 * @property {boolean} [ghost]
 * @property {boolean} [pill]
 * @property {boolean} [primary]
 * @property {boolean} [secondary]
 * @property {boolean} [tertiary]
 * @property {boolean} [white]
 * @property {boolean} [black]
 * @property {boolean} [gradient]
 * @property {() => void} [onClick]
 */

/**
 * @extends Component<ButtonProps>
 */
export class Button extends Component
{

    state = {
        focused: false
    }

    handleFocus = () =>
    {
        this.setState({ focused: true })
    }

    handleBlur = () =>
    {
        this.setState({ focused: false })
    }

    render ()
    {
        if (this.props.to) return this.renderLink()
        return this.renderButton()
    }

    get className ()
    {
        return classNames(
            'Button',
            this.props.className,
            {
                'Button--disabled': this.props.disabled,
                'Button--full': this.props.full,
                'Button--ghost': this.props.ghost,
                'Button--primary': this.props.primary,
                'Button--secondary': this.props.secondary,
                'Button--tertiary': this.props.tertiary,
                'Button--white': this.props.white,
                'Button--black': this.props.black,
                'Button--gradient': this.props.gradient,
                'Button--focus': this.state.focused,
                'Button--pill': this.props.pill,
                'Button--active': this.props.active,
            }
        )
    }

    renderLink ()
    {
        return (
            <Link
                className={this.className}
                disabled={this.props.disabled}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                onClick={this.props.onClick}
                to={this.props.disabled ? '#' : this.props.to}
            >
                <span className='Button-label'>
                    {this.props.label || this.props.children}
                </span>
            </Link>
        )
    }

    renderButton ()
    {
        return (
            <button
                className={this.className}
                type={this.props.submit ? 'submit' : 'button'}
                disabled={this.props.disabled}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                onClick={this.props.onClick}
            >
                <span className={'Button-label'}>
                    {this.props.label || this.props.children}
                </span>
            </button>
        )
    }
}
