import { BLENDMODE } from 'client/constants'
import { Color } from 'client/model/Color'
import { Record } from 'client/model/Record'
import { isDefined } from 'client/util/default'
import { imageDataToDataURI } from 'client/util/graphics'
import { int } from 'client/util/math'
import { Map } from 'immutable'

export class SparseImage extends Record({
    /**
     * @type {Map<number, Map<number, Color>}
     */
    pixels: Map(),

    minX: Infinity,

    maxX: -Infinity,

    minY: Infinity,

    maxY: -Infinity,

    imageData: null,

    dataURI: null,
}) {
    hasPixel (x, y)
    {
        return this.pixels.hasIn(x, y)
    }

    get offsetX ()
    {
        return this.minX
    }

    get offsetY ()
    {
        return this.minY
    }

    static fromImageData (imageData, dx = 0, dy = 0)
    {
        const dataURI = imageDataToDataURI(imageData)
        return SparseImage.create({ dataURI, imageData }).copyImage(imageData, dx, dy)
    }

    static fromFunction (fn, width, height, dx = 0, dy = 0)
    {
        width += dx
        height += dy
    
        let op = SparseImage.create()

        for (let x = dx; x < width; x++) {
            for (let y = dy; y < height; y++) {
                const color = fn(x, y, width, height)
                if (!color) continue
                if (color instanceof Color === false) continue
                if (color.a <= 0) continue
                if (color.null) continue
                op = op.set(x, y, color)
            }
        }

        return op.recalculateImages()
    }

    get width ()
    {
        if (this.minX === Infinity) return 0
        return this.maxX - this.minX + 1
    }

    get height ()
    {
        if (this.minY === Infinity) return 0
        return this.maxY - this.minY + 1
    }

    setPixel (x, y, color)
    {
        x = int(x)
        y = int(y)

        const op = this
            .set('minX', Math.min(x, this.minX))
            .set('maxX', Math.max(x, this.maxX))
            .set('minY', Math.min(y, this.minY))
            .set('maxY', Math.max(y, this.maxY))

        return op.setIn(['pixels', int(x), int(y)], color)
    }

    /**
     * @param {ImageData} imageData 
     */
    copyImage (imageData, dx = 0, dy = 0)
    {
        let op = this

        for (let i = 0; i < imageData.data.length; i += 4) {
            const color = Color.fromImageData(i, imageData)

            if (color.a <= 0) continue
            const ri = i / 4
            const x = ri % imageData.width + dx
            const y = int(ri / imageData.width) + dy

            op = op.setPixel(x, y, color)
        }

        return op
    }

    clear (x, y)
    {
        x = int(x)
        y = int(y)
        if (!this.hasPixel(x, y)) return this
        let op = this.deleteIn(['pixels', x, y])
        if (x !== op.minX && x !== op.maxX && y !== op.minY && y !== op.maxY) return op
        return op.recalculateBounds()
    }

    recalculateBounds ()
    {
        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity

        this.pixels.forEach((v, x) =>
        {
            minX = Math.min(x, minX)
            maxX = Math.max(x, maxX)
            v.forEach((_, y) =>
            {
                minY = Math.min(y, minY)
                maxY = Math.max(y, maxY)
            })
        })

        return this.merge({ minX, maxX, minY, maxY })
    }

    recalculateImages ()
    {
        const imageData = new ImageData(this.width, this.height)

        this.forEach((x, y, color) =>
        {
            const i = (x + y * imageData.width) * 4
            imageData.data[i] = color.R
            imageData.data[i + 1] = color.G
            imageData.data[i + 2] = color.B
            imageData.data[i + 3] = color.A
        })

        const dataURI = imageDataToDataURI(imageData)
        return this.merge({ imageData, dataURI })
    }

    /**
     * @param {(x: number, y: number, color: Color)} fn 
     */
    forEach (fn)
    {
        this.pixels.forEach((v, x) =>
        {
            v.forEach((c, y) =>
            {
                fn(x, y, c)
            })
        })
    }

    stampPath (
        path,
        imageData,
        opts = {}
    )
    {
        const _color = opts.color
        if (isDefined(_color)) {
            for (const { x, y } of path) {
                this.stamp(x, y, imageData, opts)
            }
        } else {
            for (const { x, y, color } of path) {
                opts.color = color
                this.stamp(x, y, imageData, opts)
            }
        }
    }

    stamp (
        x,
        y,
        imageData,
        {
            mask = null,
            color,
            blendmode = BLENDMODE.ALPHA,
            // overflow = OVERFLOW.NONE
        } = {})
    {
        const alphaBlend = blendmode === BLENDMODE.ALPHA
        this.forEach((dx, dy, dcolor) =>
        {
            this.putPixel(
                x + dx,
                y + dy,
                color || dcolor,
                imageData,
                alphaBlend,
                mask
            )
        })
    }

    putPixel (x, y, color, imageData, blendAlpha, mask)
    {

        const i = (x + imageData.width * y) * 4
    
        if (mask) {
            if (mask[i]) return
            mask[i] = true
        }

        if (!blendAlpha || color.a >= 1) {
            // Direct copy
            imageData.data[i    ] = color.R
            imageData.data[i + 1] = color.G
            imageData.data[i + 2] = color.B
            imageData.data[i + 3] = color.A
            return
        }

        // Blend color
        const ar = color.R // 0 - 255 red
        const ag = color.G // 0 - 255 green
        const ab = color.B // 0 - 255 blue
        const aa = color.a // 0 - 1 alpha
    
        const br = imageData.data[i]           // 0 - 255 red
        const bg = imageData.data[i + 1]       // 0 - 255 green
        const bb = imageData.data[i + 2]       // 0 - 255 blue
        const ba = imageData.data[i + 3] / 255 // 0 - 1 alpha

        const a = aa + ba * (1 - aa)
        const r = (ar * aa + br * ba * (1 - aa)) / a
        const g = (ag * aa + bg * ba * (1 - aa)) / a
        const b = (ab * aa + bb * ba * (1 - aa)) / a
        
        imageData.data[i    ] = r
        imageData.data[i + 1] = g
        imageData.data[i + 2] = b
        imageData.data[i + 3] = a * 255
    }
}
