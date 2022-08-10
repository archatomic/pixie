import { Component } from 'react'
import classNames from 'classnames'

const classes = (baseClass, variants, cmp, ...args) => classNames(
  baseClass,
  variants.map(v => (cmp?.props[v] || cmp?.state[v]) && `${baseClass}--${v}`),
  ...args
)

/**
 * @typedef {object} ButtonProps
 * @property {string} [label]
 * @property {import('react').ReactNode} [children]
 * @property {boolean} [submit]
 * @property {string} [className]
 * @property {string} [to]
 * @property {boolean} [disabled]
 * @property {boolean} [full]
 * @property {boolean} [ghost]
 * @property {boolean} [primary]
 * @property {boolean} [secondary]
 * @property {boolean} [tertiary]
 * @property {boolean} [white]
 * @property {boolean} [gradient]
 * @property {() => void} [onClick]
 */

/**
 * @extends Component<ButtonProps>
 */
export class Button extends Component {
  get className () {
    return classes(
      'Button',
      [
        'disabled',
        'full',
        'ghost',
        'primary',
        'secondary',
        'tertiary',
        'white',
        'gradient'
      ],
      this,
      this.props.className,
      {
        'Button--focus': this.state.focused
      }
    )
  }

  state = {
    focused: false
  }

  handleFocus = () => {
    this.setState({ focused: true })
  }

  handleBlur = () => {
    this.setState({ focused: false })
  }

  render () {
    if (this.props.to) {
      return this.renderLink()
    }
    return this.renderButton()
  }

  renderLink () {
    return null
  }

  renderButton () {
    return (
      <button
        className={this.className}
        type={this.props.submit ? 'submit' : 'button'}
        disabled={this.props.disabled}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onClick={this.props.onClick}
      >
        <span className='Button-label'>
          {this.props.label || this.props.children}
        </span>
      </button>
    )
  }
}
