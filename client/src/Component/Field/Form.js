import { Component, createContext } from 'react'

import classNames from 'classnames'
import { ensureArray } from 'Pixie/Util/array'
import { isEmpty } from 'Pixie/Util/default'
import { randomString } from 'Pixie/Util/random'

/**
 * @type {import('react').Context<Form>}
 */
export const FormContext = createContext(null)

/**
 * @typedef {object} FormProps
 * @prop {string} [className = '']
 * @prop {import('react').ReactNode} [children = null]
 * @prop {(data: any) => Promise} [onSubmit]
 */

const STATE = Object.freeze({
    IDLE: 'idle',
    PROCESSING: 'processing',
    COMPLETE: 'complete',
    ERROR: 'error'
})

/**
 * @extends {Component<FormProps>}
 */
export class Form extends Component
{
    state = {
        id: randomString(32),
        errors: [],
        state: STATE.IDLE
    }

    fields = {}

    registerField (field)
    {
        if (!field?.state?.id) return
        this.fields[field.state.id] = field
    }

    deregisterField (field)
    {
        if (!field?.state?.id) return
        delete this.fields[field.state.id]
    }

    handleSubmit = e =>
    {
        e.preventDefault()
        this.submit()
    }

    async submit ()
    {
        let errors = []
        for (const field of Object.values(this.fields)) {
            const valid = await field.validate()
            if (!valid) errors = errors.concat(field.state.errors)
        }

        if (errors.length !== 0) {
            this.setState({ errors: [new Error('Please check your entries')], state: STATE.ERROR })
            return
        }

        try {
            const data = this.getData()

            const response = this.props.onSubmit && this.props.onSubmit(data)

            // Only set processing state on async jobs
            if (response?.then) this.setState({ errors: [], state: STATE.PROCESSING })

            await response
        } catch (e) {
            this.setState({ errors: [e], state: STATE.ERROR })
            return
        }
        this.setState({ state: STATE.COMPLETE })
    }

    getData ()
    {
        const op = {}

        for (const field of Object.values(this.fields)) {
            this.setIn(op, ensureArray(field.props.name), field.state.value)
        }

        return op
    }

    setIn (obj, path, val)
    {
        let current = obj
        const last = path.pop()

        for (const segment of path) {
            if (!current[segment]) current[segment] = {}
            current = current[segment]
        }

        current[last] = val
    }

    render ()
    {
        return (
            <FormContext.Provider value={this} key={this.state.id}>
                <form className={classNames('Form', `Form--${this.state.state}`, this.props.className)} onSubmit={this.handleSubmit}>
                    {this.renderErrors()}
                    {this.props.children}
                </form>
            </FormContext.Provider>
        )
    }

    renderErrors ()
    {
        if (isEmpty(this.state.errors)) return null
        return (
            <div className='Form-errors'>
                {this.state.errors.map((e, i) => <div key={i} className='Form-error'>{e.message}</div>)}
            </div>
        )
    }
}
