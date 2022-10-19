import { Component } from 'react'
import { FormContext } from './Form'
import { Transition } from '../Transition'
import classNames from 'classnames'
import { def, isEmpty } from 'Pixie/util/default'
import { randomString } from 'Pixie/util/random'
import { validate } from 'Pixie/util/validation'
import { safeCall } from 'Pixie/util/safeCall'

/**
 * @typedef {object} FieldProps
 * @prop {any} [value] Value prop.
 * @prop {any} [validate] Validations.
 * @prop {string} [label] Human readable name of the field.
 * @prop {string} [name] Machine readable name of the field.
 * @prop {string} [className]
 * @prop {boolean} [disabled]
 * @prop {boolean} [invisibile]
 * @prop {boolean} [pill]
 * @prop {boolean} [tight]
 * @prop {boolean} [inline]
 * @prop {boolean} [placeholderLabel]
 * @prop {boolean} [validateOnChange]
 */

/**
 * @template AdditionalProps
 * @extends {Component<FieldProps & AdditionalProps>}
 */
export class Field extends Component
{
    /**
     * @type {FormContext}
     **/
    static contextType = FormContext

    /**
     * @type {import('./Form').Form} Why do I need this?
     */
    context

    state = {
        rawValue: this.transformValue(def(this.props.value, this.defaultValue())),
        value: this.transformValue(def(this.props.value, this.defaultValue())),
        id: randomString(),
        focused: false,
        errors: []
    }

    defaultValue ()
    {
        return null
    }

    focus = () => this.setState({ focused: true })

    blur = () =>
    {
        this.setState({ focused: false, rawValue: this.state.value })
        safeCall(
            this.props.onCommit,
            {
                field: this,
                name: this.props.name,
                value: this.state.rawValue
            }
        )
    }

    setValue (rawValue, passive = false)
    {
        const value = this.transformValue(rawValue)
        if (!this.state.focused) rawValue = value
        else if (passive) rawValue = this.state.rawValue
        this.setState({
            rawValue: `${rawValue}`,
            value,
            errors: this.state.value === value ? this.state.errors : []
        })
        if (this.props.validateOnChange) this.validate(value)
    }

    validate (value = this.state.value)
    {
        this.setState({ errors: validate(value, this.props.validate) })
    }

    get invalid ()
    {
        return this.state.errors.length > 0
    }

    componentDidMount ()
    {
        if (!this.context) return
        this.context.registerField(this)
    }

    componentWillUnmount ()
    {
        if (!this.context) return
        this.context.deregisterField(this)
    }

    /**
     * @param {FieldProps} props
     */
    componentDidUpdate (props, state)
    {
        if (props.value !== this.props.value) {
            // passive updates won't rewrite rawValue while focused
            this.setValue(this.props.value, true)
        }

        if (state.rawValue !== this.state.rawValue) {
            safeCall(
                this.props.onChange,
                {
                    field: this,
                    name: this.props.name,
                    value: this.state.rawValue,
                    oldValue: state.rawValue
                }
            )
        }
    }

    handleContentClicked = e => this.contentWasClicked(e)

    contentWasClicked (event)
    {
        // To be implemented in subclasses
    }

    transformValue (value)
    {
        // to be implemented in subclasses
        return value
    }

    getVariant ()
    {
        return this.constructor.name[0].toLowerCase() + this.constructor.name.substring(1)
    }

    render ()
    {
        return (
            <div className={classNames(
                'Field',
                `Field--${this.getVariant()}`,
                this.props.className,
                {
                    'Field--unfocus': !this.state.focused,
                    'Field--focus': this.state.focused,
                    'Field--error': this.invalid,
                    'Field--inline': this.props.inline,
                    'Field--placeholderLabel': this.props.placeholderLabel,
                    'Field--pill': this.props.pill,
                    'Field--disabled': this.props.disabled,
                    'Field--invisible': this.props.invisible,
                    'Field--tight': this.props.tight,
                    'Field--empty': isEmpty(this.state.value),
                    'Field--filled': !isEmpty(this.state.value)
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

    renderLabel ()
    {
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

    renderContent ()
    {
        // To implement
        return null
    }

    renderErrors ()
    {
        if (!this.invalid) return null
        const [error, ...addtnl] = this.state.errors
        return (
            <div className='Field-errors'>
                {error.message} {addtnl.length > 0 && `(+${addtnl.length})`}
            </div>
        )
    }
}
