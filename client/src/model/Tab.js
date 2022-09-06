import { PixieCel } from './PixieCel'
import { Record } from './Record'

export class Tab extends Record({
    fragment: null,
    frame: 0,
    layer: 0,
    zoom: 1,
    rotate: 0,
    x: 0,
    y: 0,
    toolCel: null,
    hideActive: false,
}) {
    updateToolCel (imageData, hideActive = false)
    {
        if (this.toolCel) return this.setIn(['toolCel', 'data'], imageData)
        return this.merge({
            toolCel: PixieCel.fromImageData(imageData),
            hideActive
        })
    }

    clearToolCel ()
    {
        return this.merge({toolCel: null, hideActive: false})
    }
}