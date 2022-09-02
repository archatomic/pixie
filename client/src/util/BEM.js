/**
 * @typedef {object} BEMOpts
 * @prop {string[]} [variants=[]]
 * @prop {string} [elementDelim='-']
 * @prop {string} [variantDelim='--']
 */

import classNames from 'classnames'
import { def } from './default'

export class BEM
{
    /**
     * @param {string} block 
     * @param {BEMOpts} bemOpts
     */
    constructor(
        block,
        {
            variants = [],
            elementDelim = '-',
            variantDelim = '--'
        } = {}
    )
    {
        this.block = block
        this.variants = variants
        this.elementDelim = elementDelim
        this.variantDelim = variantDelim
    }

    /**
     * Build the block class name
     *
     * @param {import('client/components/Component').Component} [component]
     * @param  {...any} [args]
     *
     * @returns {string}
     */
    className (component, ...args)
    {
        const blockName = def(component?.props?.blockName, this.block)
        
        return classNames(
            blockName,
            component?.props?.className,
            this.getVariantClasses(blockName, component, this.variants),
            ...args
        )
    }

    getVariantClasses (block, component, variants)
    {
        if (typeof variants === 'string') {
            if (!this.componentHasState(component, variants)) return null
            return this.variant(block, variants)
        }

        if (variants instanceof Array) {
            return variants.map(v => this.getVariantClasses(block, component, v))
        }

        if (typeof variants !== 'object') return null

        return Object.keys(variants).map(
            variant => 
            {
                if (!this.componentHasState(component, variant)) return null
                return this.variant(block, variants[variant])
            }
        )
    }

    componentHasState (component, variant)
    {
        return this.has(component?.props, variant) || this.has(component?.state, variant)
    }

    has (obj, key)
    {
        return (obj && obj[key])
    }

    /**
     * Create a variant class for the block
     *
     * @param {string} block 
     * @param {string} variant 
     * @returns 
     */
    variant (block, variant)
    {
        return `${block}${this.variantDelim}${variant}`
    }

    /**
     * Create an element class
     *
     * @param {string} element 
     * @returns {string}
     */
    element (component, element, ...args)
    {
        const blockName = def(component?.props.blockName, this.block)
        return classNames(`${blockName}${this.elementDelim}${element}`, ...args)
    }

    /**
     * Create a recursive element BEM instance
     *
     * @param {string} child 
     * @param {BEMOpts} bemOpts
     */
    child (
        component,
        childName,
        {
            variants = [],
            elementDelim = this.elementDelim,
            variantDelim = this.variantDelim
        } = {}
    ) {
        return new BEM(
            this.element(component, childName),
            { variants, elementDelim, variantDelim }
        )
    }
}