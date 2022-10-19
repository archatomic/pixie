import { isNumber, precision } from 'Pixie/util/math'
import { Field } from './Field'

/**
 * @typedef {object} AdditionalNumberProps
 * @prop {boolean} [autoSelectOnFocus = false] Auto select on focus.
 * @prop {boolean} [autofocus = false] Auto focus on mount.
 * @prop {import('react').InputHTMLAttributes<HTMLInputElement>} [inputProps = undefined] Props for the Input
 */

/** @extends {Field<AdditionalNumberProps>} */
export class NumberField extends Field
{
    handleFocus = (e) =>
    {
        this.focus()
        if (this.props.autoSelectOnFocus) {
            e.target.select()
        }
    }

    defaultValue ()
    {
        return 0
    }

    transformValue (value)
    {
        value = parseFloat(value)
        if (isNumber(this.props.min)) value = Math.max(this.props.min, value)
        if (isNumber(this.props.max)) value = Math.min(this.props.max, value)
        if (isNumber(this.props.precision)) value = precision(value, this.props.precision)
        if (isNaN(value)) return this.state.value
        return value
    }

    componentDidMount ()
    {
        super.componentDidMount()
        if (this.props.autofocus) {
            this._ref.focus()
        }
    }

    contentWasClicked ()
    {
        this._ref?.focus()
    }

    handleBlur = this.blur
    handleChange = e => this.setValue(e.target.value)
    handleRef = ref => { this._ref = ref }

    renderContent ()
    {
        const props = {
            id: this.state.id,
            className: 'Field-number',
            name: this.props.name,
            value: this.state.rawValue,
            disabled: this.props.disabled,
            onChange: this.handleChange,
            onInput: this.handleChange,
            onKeyUp: this.handleChange,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur,
            ref: this.handleRef
        }

        return <input {...this.props.inputProps} {...props} type='text' inputMode='numeric' />
    }
}
