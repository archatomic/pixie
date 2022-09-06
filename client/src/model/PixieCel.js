import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_WIDTH } from 'client/constants'

import { Record } from './Record'
import { createImageData } from 'client/util/graphics'

export class PixieCel extends Record({
    width: DEFAULT_FRAGMENT_WIDTH,
    height: DEFAULT_FRAGMENT_HEIGHT,
    data: (props) =>
    {
        if (props._isNull) return null // Don't create image data
        return createImageData(props.width, props.height)
    },
    inherited: true
}) {
    /**
     * @param {ImageData} imageData 
     * @returns {PixieCel}
     */
    static fromImageData (imageData)
    {
        return this.create({
            width: imageData.width,
            height: imageData.height,
            data: imageData,
            inherited: false
        })
    }

    createBlankImageData ()
    {
        return createImageData(this.width, this.height)
    }

    coordsToIndex (x, y)
    {
        return (this.width * y + x) * 4
    }

    indexToCoords (i)
    {
        i = Math.floor(i / 4)
        return { x: i % this.width, y: Math.floor(i / this.width) }
    }
}
