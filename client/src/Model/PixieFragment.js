import
{
    DEFAULT_FRAGMENT_HEIGHT,
    DEFAULT_FRAGMENT_WIDTH,
    VISIBILITY
} from 'Pixie/constants'

import { Map, List } from 'immutable'
import { Record } from './Record'

const FIT_PADDING = 20

/**
 * @typedef {string} FrameID
 * @typedef {string} LayerID
 * @typedef {string} CelID
 */

export class PixieFragment extends Record({
    /** @type {number} */
    width: DEFAULT_FRAGMENT_WIDTH,
    /** @type {number} */
    height: DEFAULT_FRAGMENT_HEIGHT,
    /** @type {string} */
    name: 'Untitled',
    /** @type {List<LayerID>} */
    layers: List(),
    /** @type {List<FrameID>} */
    frames: List(),
    /** @type {Map<FrameID, Map<LayerID, CelID>>} */
    cels: Map()
}) {
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

    getCelKey (layer, frame)
    {
        // Replace me with operation
        layer = this.getLayer(layer).pk
        frame = this.getFrame(frame).pk
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

    getLayer (layer)
    {
        if (typeof layer === 'number') layer = this.layers.get(layer)
        return this.state.layers.find(layer)
    }

    getFrame (frame)
    {
        if (typeof frame === 'number') frame = this.frames.get(frame)
        return this.state.frames.find(frame)
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

        if (celopts.visible !== undefined) {
            const visible = []
            const soloed = []
            const hidden = []
            for (const frame of frames) {
                for (const layer of layers) {
                    const cel = this.getCelKey(layer, frame)
                    const l = this.state.layers.find(layer)
                    if (l.soloed) soloed.push(cel)
                    if (l.visible) visible.push(cel)
                    if (l.hidden) hidden.push(cel)
                }
            }

            // Explicitly return visible cels
            if (celopts.visible === VISIBILITY.VISIBLE)
                return visible

            // Explicity return hidden cels
            if (celopts.visible === VISIBILITY.HIDDEN)
                return hidden

            // Explicitly return soloed cels
            if (celopts.visible === VISIBILITY.SOLO)
                return soloed

            // "auto" mode. Return either the soloed or the visible
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
