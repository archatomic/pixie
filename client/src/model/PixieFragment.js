import {
    DEFAULT_FRAGMENT_HEIGHT,
    DEFAULT_FRAGMENT_NUM_FRAMES,
    DEFAULT_FRAGMENT_NUM_LAYERS,
    DEFAULT_FRAGMENT_WIDTH
} from 'client/constants'

import { Map } from 'immutable'
import { PixieCel } from './PixieCel'
import { PixieFrame } from './PixieFrame'
import { PixieLayer } from './PixieLayer'
import { Record } from './Record'

const FIT_PADDING = 20

export class PixieFragment extends Record({
    width: DEFAULT_FRAGMENT_WIDTH,
    height: DEFAULT_FRAGMENT_HEIGHT,
    layers: PixieLayer.Collection.create(),
    frames: PixieFrame.Collection.create(),
    cels: Map()
}) {
    static create ({
        width = DEFAULT_FRAGMENT_WIDTH,
        height = DEFAULT_FRAGMENT_HEIGHT,
        numLayers = DEFAULT_FRAGMENT_NUM_LAYERS,
        numFrames = DEFAULT_FRAGMENT_NUM_FRAMES
    } = {}) {
        return new PixieFragment({ width, height })
            .addLayers(numLayers)
            .addFrames(numFrames)
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

    addLayers (count)
    {
        let op = this
        for (let i = 1; i <= count; i++) op = op.addLayer()
        return op
    }

    addLayer (at = -1)
    {
        return this.delegateSet('layers', 'insert', PixieLayer.create(), at)
    }

    addFrames (count)
    {
        let op = this
        for (let i = 1; i <= count; i++) op = op.addFrame()
        return op
    }

    addFrame (at = -1)
    {
        return this.delegateSet('frames', 'insert', PixieFrame.create(), at)
    }

    newCel ()
    {
        return PixieCel.create({ width: this.width, height: this.height })
    }

    getCel(layer, frame) {
        layer = this.layers.getID(layer)
        frame = this.frames.getID(frame)
        return this.cels.getIn([frame, layer], PixieCel.Null)
    }
    
    fillCels ()
    {
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
        this.saveCel(layer, frame, this.newCel())
    }

    getLayer(layer) {
        return this.layers.find(layer)
    }

    getLayerCels(layer) {
        layer = this.layers.getID(layer)
        return this.frames.map(v => {
            const frame = this.frames.getID(v)
            return this.getCel(layer, frame)
        })
    }

    getFrameCels(frame) {
        frame = this.frames.getID(frame)
        return this.layers.map(v => {
            const layer = this.layers.getID(v)
            return {
                layer,
                cel: this.getCel(layer, frame)
            }
        })
    }

    saveCel (layer, frame, cel)
    {
        layer = this.layers.getID(layer)
        frame = this.frames.getID(frame)
        return this.setIn(['cels', frame, layer], cel)
    }

    deleteFrame (frame) {
        frame = this.frames.getID(frame)
        return this
            .delegateSet('frames', 'remove', frame)
            .delegateSet('cels', 'delete', frame)
    }

    deleteLayer (layer) {
        layer = this.layers.getID(layer)

        let op = this.delegateSet('layers', 'remove', layer)

        // Delete layer cels
        op.cels.forEach((_, i) => { op = op.deleteIn(['cels', i, layer]) })

        return op
    }
}