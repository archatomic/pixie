import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_WIDTH } from 'Pixie/constants'

import { Record } from './Record'

export class PixieCel extends Record({
    fragment: null,
    width: DEFAULT_FRAGMENT_WIDTH,
    height: DEFAULT_FRAGMENT_HEIGHT,
    x: 0,
    y: 0,
    data: (props) =>
    {
        if (props._isNull) return null // Don't create image data
        return new ImageData(props.width, props.height)
    },
    preview: null,
    overlayPreview: false
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

    showPreview (preview, overlayPreview = false)
    {
        return this.merge({
            preview,
            overlayPreview: !!overlayPreview
        })
    }

    sanitize ()
    {
        return this.merge({
            data: this.data && '<IMAGE DATA>',
            preview: this.preview && '<IMAGE DATA>'
        })
    }

    clearPreview ()
    {
        return this.merge({
            preview: null,
            overlayPreview: false
        })
    }

    toBinaryString ()
    {
        return this.pk + String.fromCharCode(
            this.width >> 8,
            this.width & 255,
            this.height >> 8,
            this.height & 255,
            ...this.data.data
        )
    }

    static fromBinaryString (str)
    {
        const pk = str.substring(0, 21)
        const width = (str.charCodeAt(21) << 8) + str.charCodeAt(22)
        const height = (str.charCodeAt(23) << 8) + str.charCodeAt(24)
        const pxData = []

        for (let i = 25; i < str.length; i++) {
            pxData.push(str.charCodeAt(i))
        }

        const data = new ImageData(width, height)
        data.data.set(pxData)

        return PixieCel.create({
            _id: pk,
            width,
            height,
            data
        })
    }
}
