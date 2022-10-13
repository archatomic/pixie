import {
    DEFAULT_FRAGMENT_HEIGHT,
    DEFAULT_FRAGMENT_WIDTH
} from 'client/constants'

import { Map, List } from 'immutable'
import { PixieCel } from './PixieCel'
import { Record } from './Record'

const FIT_PADDING = 20

/**
 * @typedef {string} FrameID
 * @typedef {string} LayerID
 */

export class PixieFragment extends Record({
    /** @type {number} */
    width: DEFAULT_FRAGMENT_WIDTH,
    /** @type {number} */
    height: DEFAULT_FRAGMENT_HEIGHT,
    /** @type {List<LayerID>} */
    layers: List(),
    /** @type {List<FrameID>} */
    frames: List(),
    /** @type {Map<FrameID, Map<LayerID, string>>} */
    cels: Map()
}) {
    static create ({
        width = DEFAULT_FRAGMENT_WIDTH,
        height = DEFAULT_FRAGMENT_HEIGHT
    } = {}) {
        return new PixieFragment({ width, height })
    }

    get aspectRatio ()
    {
        return this.height / this.width
    }

    getDefaultZoom ()
    {
        const fitWidth = (window.innerWidth - FIT_PADDING * 2) / this.width
        const fitHeight = (window.innerHeight - FIT_PADDING * 2) / this.height
        return Math.min(fitWidth, fitHeight)
    }

    setFrame (frame)
    {
        // Replace me with operation
        return this.delegateSet('frames', 'add', frame)
    }

    newCel ()
    {
        // Replace me with operation
        return PixieCel.create({ width: this.width, height: this.height })
    }

    nullCel ()
    {
        // Replace me with operation
        return PixieCel.Null.merge({width: this.width, height: this.height})
    }

    getCelKey(layer, frame) {
        // Replace me with operation
        layer = this.state.layers.getID(layer)
        frame = this.state.frames.getID(frame)
        const cel = this.cels.getIn([frame, layer])
        return {
            layer,
            frame,
            cel
        }
    }

    getCel (layer, frame)
    {
        const { cel } = this.getCelKey(layer, frame)
        return this.state.cels.find(cel)
    }

    getLayer(layer) {
        return this.state.layers.find(layer)
    }

    /**
     * @typedef {object} CelOptions
     * @property {string} [frame]
     * @property {string} [layer]
     * @property {boolean} [visible]
     */

    /**
     * @typedef {object} CelDef
     * @property {string} frame
     * @property {string} layer
     * @property {string} cel
     */

    /**
     * Fetch cel keys. Can drill down to a frame and / or layer, or choose
     * to only fetch visible cels.
     *
     * @param {CelOptions} celopts
     *
     * @returns {CelDef[]}
     */
    getCels (celopts = {})
    {
        const frames = celopts.frame !== undefined ? [celopts.frame] : this.frames
        const layers = celopts.layer !== undefined ? [celopts.layer] : this.layers

        if (celopts.visible === true) {
            const visible = []
            const soloed = []
            for (const frame of frames) {
                for (const layer of layers) {
                    const cel = this.getCelKey(layer, frame)
                    const l = this.state.layers.find(layer)
                    if (l.soloed) soloed.push(cel)
                    if (l.visible) visible.push(cel)
                }
            }
            return soloed.length > 0 ? soloed : visible
        }

        const op = []
        for (const frame of frames) {
            for (const layer of layers) {
                op.push(this.getCelKey(layer, frame))
            }
        }
        return op
    }
}