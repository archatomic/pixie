import { Component } from 'client/components/Component'
import { Link } from 'react-router-dom'

/**
 * @typedef {object} ButtonProps
 * @property {string} [label]
 * @property {import('react').ReactNode} [children]
 * @property {boolean} [submit]
 * @property {string} [to]
 * @property {boolean} [disabled]
 * @property {boolean} [full]
 * @property {boolean} [ghost]
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
  bemBlock () { return 'Button' }

  bemVariants ()
  {
    return [
      'disabled',
      'full',
      'ghost',
      'primary',
      'secondary',
      'tertiary',
      'white',
      'black',
      'gradient',
      {
        'focused': 'focus'
      }
    ]
  }

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

  renderLink () {
    return (
      <Link
        className={this.className}
        disabled={this.props.disabled}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onClick={this.props.onClick}
        to={this.props.disabled ? '#' : this.props.to}
      >
        <span className={this.bemElement('label')}>
          {this.props.label || this.props.children}
        </span>
      </Link>
    )
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
        <span className={this.bemElement('label')}>
          {this.props.label || this.props.children}
        </span>
      </button>
    )
  }
}
