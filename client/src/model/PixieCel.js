import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_WIDTH } from 'client/constants'

import { Record } from './Record'

export class PixieCel extends Record({
    width: DEFAULT_FRAGMENT_WIDTH,
    height: DEFAULT_FRAGMENT_HEIGHT,
    data: (props) =>
    {
        if (props._isNull) return null // Don't create image data
        return new ImageData(props.width, props.height)
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
        return new ImageData(this.width, this.height)
    }

    copyImageData ()
    {
        const op = this.createBlankImageData()
        if (this.data) op.data.set(this.data.data)
        return op
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
