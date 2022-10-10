import {
    DEFAULT_FRAGMENT_HEIGHT,
    DEFAULT_FRAGMENT_NUM_FRAMES,
    DEFAULT_FRAGMENT_NUM_LAYERS,
    DEFAULT_FRAGMENT_WIDTH
} from 'client/constants'

import { Map, List } from 'immutable'
import { PixieCel } from './PixieCel'
import { Record } from './Record'

const FIT_PADDING = 20

export class PixieFragment extends Record({
    /** @type {number} */
    width: DEFAULT_FRAGMENT_WIDTH,
    /** @type {number} */
    height: DEFAULT_FRAGMENT_HEIGHT,
    /** @type {List<string>} */
    layers: List(),
    /** @type {List<string>} */
    frames: List(),
    /** @type {Map<any, Map<any, PixieCel>>} */
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

    getCel(layer, frame) {
        // Replace me with operation
        layer = this.state.layers.getID(layer)
        frame = this.state.frames.getID(frame)
        return this.cels.getIn([frame, layer], this.nullCel())
    }
    
    fillCels ()
    {
        // Replace me with operation
        let op = this
        this.frames.forEach((_, frame) => {
            this.layers.forEach((_, layer) => {
                op = op.createCel(layer, frame)
            })
        })
        return op
    }

    createCel(layer, frame)
    {
        // Replace me with operation
        this.saveCel(layer, frame, this.newCel())
    }

    getLayer(layer) {
        return this.state.layers.find(layer)
    }

    getLayerCels(layer) {
        layer = this.state.layers.getID(layer)
        return this.frames.map(frame => {
            return this.getCel(layer, frame)
        })
    }

    getFrameCels(frame) {
        frame = this.state.frames.getID(frame)
        return this.layers.map(layer => {
            return {
                layer,
                cel: this.getCel(layer, frame)
            }
        })
    }

    isSoloing ()
    {
        for (const layer of this.layers.toArray()) {
            if (layer.soloed) return true
        }
        return false
    }

    saveCel (layer, frame, cel)
    {
        // Replace me with operation
        layer = this.state.layers.getID(layer)
        frame = this.state.frames.getID(frame)
        return this.setIn(['cels', frame, layer], cel)
    }

    deleteFrame (frame) {
        // Replace me with operation
        frame = this.frames.getID(frame)
        return this
            .delegateSet('frames', 'remove', frame)
            .delegateSet('cels', 'delete', frame)
    }

    deleteLayer (layer) {
        // Replace me with operation
        layer = this.layers.getID(layer)

        let op = this.delegateSet('layers', 'remove', layer)

        // Delete layer cels
        op.cels.forEach((_, i) => { op = op.deleteIn(['cels', i, layer]) })

        return op
    }
}