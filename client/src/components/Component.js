import { BEM } from 'client/util/BEM'
import { Component as ReactComponent } from 'react'
import { isDefined } from 'client/util/default'

/**
 * @typedef {null|false|undefined} Falsey
 * @typedef {string|Object<string, any>|ClassDefinition[]|null|false|Falsey} ClassDefinition
 */

/**
 * @typedef {object} ComponentProps
 * @prop {string} [bemBlock]
 * @prop {ClassDefinition} [className]
 */

/**
 * @template T
 * @extends {ReactComponent<ComponentProps & T>}
 */
export class Component extends ReactComponent
{
    // overrideable in subclasses
    bemBlock () { throw new Error("Missing BEM Block Definition") }

    getBemBlock ()
    {
        if (isDefined(this.props.bemBlock)) return this.props.bemBlock
        return this.bemBlock()
    }

    // overrideable in subclasses
    bemVariants () { return [] }

    bem = new BEM(this.getBemBlock(), { variants: this.bemVariants() })

    get className ()
    {
        return this.classNames()
    }

    classNames (...args)
    {
        return this.bem.className(this, ...args)
    }

    bemElement (name, ...args) {
        return this.bem.element(this, name, ...args)
    }

    bemChild (child) {
        return this.bem.child(this, child)
    }

    bemVariant (variant)
    {
        return this.bem.variant(this.getBemBlock(), variant)
    }
}
