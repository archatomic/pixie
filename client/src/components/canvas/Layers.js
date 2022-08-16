import { Component } from "react";
import { createNode } from "client/util/createNode";
import { def } from "client/util/default";

/**
 * @typedef {object} LayerProps
 * @prop {number} [width]
 * @prop {number} [height]
 * @prop {number} [height]
 */

/**
 * @extends {Component<LayerProps>}
 */
export class Layer extends Component {
    handleRef = e => {
        if (e) this.mountCanvas(e)
        else this.unmountCanvas()
    }

    /**
     * @returns {HTMLCanvasElement}
     */
    getCanvas () {
        if (!this.canvas) {
            this.canvas = /** @type {HTMLCanvasElement} */ (createNode({ tag: 'canvas', attrs: { class: 'Layer-canvas' }}))
            this.canvas.width = def(this.props.width, 32)
            this.canvas.height = def(this.props.height, 48)
            this.ctx = this.canvas.getContext('2d')
        }
        return this.canvas
    }

    mountCanvas (parent) {
        this.root = parent
        const canvas = this.getCanvas()
        this.root.appendChild(canvas)
    }

    unmountCanvas() {
        this.root = null
    }

    render () {
        return (
            <div className='Layer' ref={this.handleRef}></div>
        )
    }
}