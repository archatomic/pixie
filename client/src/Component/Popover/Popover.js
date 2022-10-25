import { def } from 'Pixie/Util/default'

import { Component } from 'react'
import { Panel } from 'Pixie/Component/Panel'
import ReactDOM from 'react-dom'
import { allowOne } from 'Pixie/Component/HOC/allowOne'
import classNames from 'classnames'
import { safeCall } from 'Pixie/Util/safeCall'
import { Box } from 'Pixie/Component/Box'

const DEFAULT_ROOT_KEY = '___default'

/**
 * @typedef {Object} PopoverProps
 * @property {number} [x] Defaults to the center of the viewport.
 * @property {number} [y] Defaults to the center of the viewport.
 * @property {number} [left] Left side of the target rect.
 * @property {number} [top] Top of the target rect.
 * @property {number} [right] Right of the target rect.
 * @property {number} [bottom] Bottom of the target rect.
 * @property {number} [width] Width of the target rect.
 * @property {number} [height] Height of the target rect.
 * @property {string} [align='right'] Horizontal alignment
 * @property {string} [valign='below'] Horizontal alignment
 * @property {string} [root='default'] Name of the root element.
 */

/**
 * @extends {Component<PopoverProps>}
 */
export class Popover extends Component
{
    static Singular = allowOne(this)

    /**
     * @type {{[name: string]: HTMLElement}}
     */
    static roots = {}

    /**
     * Set the default root for popover element.
     *
     * @param {HTMLElement} root
     */
    static setDefaultRoot (root)
    {
        this.setRoot(DEFAULT_ROOT_KEY, root)
    }

    /**
     * Set a root by name. If no root element is provided create one.
     *
     * @param {string} name
     * @param {HTMLElement} [root]
     * @param {HTMLElement} [parent=document.body]
     */
    static setRoot (name, root, parent = document.body)
    {
        if (!root) root = this.createNode('PopoverRoot', parent)
        this.roots[name] = root
    }

    /**
     * Get a root by name. Automatically creates one if it does not exist.
     *
     * @param {string} name
     *
     * @returns {HTMLElement}
     */
    static getRoot (name)
    {
        if (!this.roots[name]) this.setRoot(name)
        return this.roots[name]
    }

    /**
     * Get the default root.
     *
     * @returns {HTMLElement}
     */
    static getDefaultRoot ()
    {
        return this.getRoot(DEFAULT_ROOT_KEY)
    }

    /**
     * Create an html div with the provided class and parent
     *
     * @param {string} className
     * @param {HTMLElement|null} [parent=null] If provided, will mount the node into the parent.
     *
     * @returns {HTMLElement}
     */
    static createNode (className, parent = null)
    {
        const el = document.createElement('div')
        el.className = className
        if (parent) parent.append(el)
        return el
    }

    state = {
        root: def(this.props.root, DEFAULT_ROOT_KEY),
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    }

    /**
     * Create a Popover container
     *
     * @returns {HTMLElement}
     */
    createContainer ()
    {
        return Popover.createNode('Popover')
    }

    /**
     * @type {Number}
     */
    get targetLeft ()
    {
        return def(this.props.left, this.props.x, Math.floor(window.innerWidth / 2))
    }

    /**
     * @type {Number}
     */
    get targetRight ()
    {
        return def(
            this.props.right,
            this.targetLeft + def(this.props.width, 0)
        )
    }

    /**
     * @type {Number}
     */
    get targetTop ()
    {
        return def(this.props.top, this.props.y, Math.floor(window.innerHeight / 2))
    }

    /**
     * @type {Number}
     */
    get targetBottom ()
    {
        return def(
            this.props.bottom,
            this.targetTop + def(this.props.height, 0)
        )
    }

    /**
     * Lookup / create the popover root and return it.
     *
     * @returns {HTMLElement}
     */
    getRoot ()
    {
        if (!this.root) this.root = Popover.getRoot(this.state.root)
        return this.root
    }

    /**
     * Lookup / create the popover container and return it.
     *
     * @returns {HTMLElement}
     */
    getContainer ()
    {
        if (!this.container) this.container = this.createContainer()
        return this.container
    }

    getX (width = this.state.width)
    {
        const align = def(this.props.align, 'right')
        let x
        switch (align) {
            case 'before':
                x = this.targetLeft - width
                break
            case 'left':
                x = this.targetLeft
                break
            case 'center':
                x = (this.targetLeft + this.targetRight - width) / 2
                break
            case 'right':
            default:
                x = this.targetRight - width
                break
            case 'after':
                x = this.targetRight
                break
        }

        let right = x + width
        if (right > window.innerWidth) right = window.innerWidth
        return Math.max(0, right - width)
    }

    getY (height = this.state.height)
    {
        const align = def(this.props.vAlign, 'below')
        let y
        switch (align) {
            case 'above':
                y = this.targetTop - height
                break
            case 'top':
                y = this.targetTop
                break
            case 'center':
                y = (this.targetTop + this.targetBottom - height) / 2
                break
            case 'bottom':
            default:
                y = this.targetBottom - height
                break
            case 'below':
                y = this.targetBottom
                break
        }

        let bottom = y + height
        if (bottom > window.innerHeight) bottom = window.innerHeight
        return Math.max(0, bottom - height)
    }

    getStyle ()
    {
        return {
            position: 'absolute',
            left: `${this.state.x / 10}rem`,
            top: `${this.state.y / 10}rem`,
        }
    }

    /**
     * Append the container to the root
     */
    componentDidMount ()
    {
        this.attach()
    }

    /**
     * Remove the container from the root
     */
    componentWillUnmount ()
    {
        this.detach()
    }

    componentDidUpdate (props)
    {
        const triggers = [
            'top', 'right', 'bottom', 'left',
            'x', 'y', 'width', 'height'
        ]

        for (const trigger of triggers) {
            if (props[trigger] !== this.props[trigger]) {
                return this.updateFromProps()
            }
        }
    }

    handlePopoverResize = e =>
    {
        this.setState({[e.type]: e.value})
    }

    updateFromProps ()
    {
        this.setState({
            x: this.getX(),
            y: this.getY()
        })
    }

    attach ()
    {
        this.getRoot().appendChild(this.getContainer())
        const ref = this.container.querySelector('.Popover-content')
        const { width, height } = ref.getBoundingClientRect()
        this.container.scrollTop // eslint-disable-line
        this.container.classList.add('Popover--show')
        this.setState({
            width,
            height,
            x: this.getX(width),
            y: this.getY(height),
        })
        safeCall(this.props.onOpen)
    }

    detach ()
    {
        this.container.append(this.container.children[0].cloneNode(true)) // Append cloned node
        this.container.classList.remove('Popover--show')
        setTimeout(this._remove, 300)
        safeCall(this.props.onClose)
    }

    _remove = () =>
    {
        this.root.removeChild(this.container)
        this.container = null
        this.root = null
    }

    render ()
    {
        return ReactDOM.createPortal(
            <>
                {this.props.shade && <div
                    className='Popover-shade'
                    onClick={this.props.onShadeClick}
                />}
                <Box
                    tag={Panel}
                    tight
                    className={classNames(
                        'Popover-content',
                        this.props.className
                    )}
                    onClick={this.props.onClick}
                    onWidth={this.handlePopoverResize}
                    onHeight={this.handlePopoverResize}
                    style={this.getStyle()}
                >
                    {this.props.children}
                </Box>
            </>,
            this.getContainer()
        )
    }
}
