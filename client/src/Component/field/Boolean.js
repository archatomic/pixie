import { Field } from './Field'

/**
 * @typedef {object} AdditionalBooleanProps
 * currently none
 */

/** @extends {Field<AdditionalBooleanProps>} */
export class Boolean extends Field {
  defaultValue () {
    return false
  }

  handleFocus = this.focus
  handleBlur = this.blur
  handleChange = () => this.setValue(!this.state.value)

  renderContent () {
    return (
      <input
        id={this.state.id}
        type='checkbox'
        className='Field-boolean'
        name={this.props.name}
        disabled={this.props.disabled}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        checked={this.state.value}
      />
    )
  }
}
