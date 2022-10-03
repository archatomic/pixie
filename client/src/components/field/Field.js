import './Field.styl'

import { Component } from 'react'
import { FormContext } from './Form'
import { Transition } from '../Transition'
import classNames from 'classnames'
import { isEmpty } from 'client/util/default'
import { randomString } from 'client/util/random'
import { validate } from 'client/util/validation'

/**
 * @typedef {object} FieldProps
 * @prop {any} [value] Value prop.
 * @prop {any} [validate] Validations.
 * @prop {string} [label] Human readable name of the field.
 * @prop {string} [name] Machine readable name of the field.
 * @prop {string} [className]
 * @prop {boolean} [disabled]
 * @prop {boolean} [pill]
 * @prop {boolean} [tight]
 * @prop {boolean} [validateOnChange]
 */

/**
 * @template AdditionalProps
 * @extends {Component<FieldProps & AdditionalProps>}
 */
export class Field extends Component {
  /**
   * @type {FormContext}
   **/
  static contextType = FormContext

  /**
   * @type {import('./Form').Form} Why do I need this?
   */
  context

  state = {
    value: this.props.value || this.defaultValue(),
    id: randomString(),
    focused: false,
    errors: []
  }

  defaultValue () {
    return null
  }

  focus = () => this.setState({ focused: true })

  blur = () => {
    this.setState({ focused: false })
    if (this.props.validateOnChange) this.validate()
  }

  setValue (value) {
    this.setState({ value, errors: this.state.value === value ? this.state.errors : [] })
    if (this.props.validateOnChange) this.validate()
  }

  validate () {
    this.setState({ errors: validate(this.state.value, this.props.validate) })
  }

  get invalid () {
    return this.state.errors.length > 0
  }

  componentDidMount () {
    if (!this.context) return
    this.context.registerField(this)
  }

  componentWillUnmount () {
    if (!this.context) return
    this.context.deregisterField(this)
  }

  /**
   * @param {FieldProps} props
   */
  componentDidUpdate (props) {
    if (props.value !== this.props.value) {
      this.setValue(this.props.value)
    }
  }

  handleContentClicked = e => this.contentWasClicked(e)

  contentWasClicked (event) {
    // To be implemented in subclasses
  }

  getVariant () {
    return this.constructor.name[0].toLowerCase() + this.constructor.name.substring(1)
  }

  render () {
    return (
      <div className={classNames(
        'Field',
        `Field--${this.getVariant()}`,
        this.props.className,
        {
          'Field--focus': this.state.focused,
          'Field--error': this.invalid,
          'Field--pill': this.props.pill,
          'Field--disabled': this.props.disabled,
          'Field--tight': this.props.tight,
          'Field--empty': isEmpty(this.state.value)
        }
      )}
      >
        {this.renderLabel()}
        <div className='Field-content' onClick={this.handleContentClicked}>{this.renderContent()}</div>
        <Transition>
          {this.renderErrors()}
        </Transition>
      </div>
    )
  }

  renderLabel () {
    if (!this.props.label) return null
    return (
      <label
        className='Field-label'
        htmlFor={this.state.id}
      >
        {this.props.label}
      </label>
    )
  }

  renderContent () {
    // To implement
    return null
  }

  renderErrors () {
    if (!this.invalid) return null
    const [error, ...addtnl] = this.state.errors
    return (
      <div className='Field-errors'>
        {error.message} {addtnl.length > 0 && `(+${addtnl.length})`}
      </div>
    )
  }
}
