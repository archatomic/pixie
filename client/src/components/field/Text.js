import { Field } from './Field'

/**
 * @typedef {object} AdditionalTextProps
 * @prop {boolean} [autoSelectOnFocus = false] Auto select on focus.
 * @prop {boolean} [autofocus = false] Auto focus on mount.
 * @prop {boolean} [multiline = false] Whether or not this is multiline.
 * @prop {boolean} [obscured = false] Whether or not field is obscured.
 * @prop {import('react').InputHTMLAttributes<HTMLInputElement>} [inputProps = undefined] Props for the Input
 * @prop {import('react').TextareaHTMLAttributes<HTMLTextAreaElement>} [textareaProps = undefined] Props for the Textarea
 */

/** @extends {Field<AdditionalTextProps>} */
export class Text extends Field {
  handleFocus = (e) => {
    this.focus()
    if (this.props.autoSelectOnFocus) {
      e.target.select()
    }
  }

  defaultValue () {
    return ''
  }

  componentDidMount () {
    super.componentDidMount()
    if (this.props.autofocus) {
      this._ref.focus()
    }
  }

  contentWasClicked () {
    this._ref?.focus()
  }

  handleBlur = this.blur
  handleChange = e => this.setValue(e.target.value)
  handleRef = ref => { this._ref = ref }

  renderContent () {
    const props = {
      id: this.state.id,
      className: 'Field-text',
      name: this.props.name,
      value: this.state.value,
      disabled: this.props.disabled,
      onChange: this.handleChange,
      onInput: this.handleChange,
      onKeyUp: this.handleChange,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      ref: this.handleRef
    }

    const type = this.props.obscured ? 'password' : 'text'

    return this.props.multiline
      ? <textarea {...this.props.textareaProps} {...props} />
      : <input type={type} {...this.props.inputProps} {...props} />
  }
}
