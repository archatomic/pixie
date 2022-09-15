import { Color } from 'client/model/Color'

/**
 * @typedef {object} StampDatum
 * @property {number} x Relative X offset
 * @property {number} y Relative Y offset
 * @property {number} [a] Optional amount. A number between 0 and 1.
 * @property {Color} [color] Optional color data.
 */

/**
 * @typedef {object} StampOpts
 * @property {Color} [color = Color.Black]
 * @property {boolean} [preventSelfIntersection=true]
 * @property {boolean} [allowOverflow=false]
 * @property {boolean} [blendAlpha=true]
 * @property {StampDatum[]} [data=[{x: 0, y: 0}]]
 */

export class Stamp
{
    /**
     * @param {StampOpts} [param0]
     */
    constructor({
        color = Color.Black,
        preventSelfIntersection = true,
        allowOverflow = false,
        blendAlpha = true,
        data = [{ x: 0, y: 0 }]
    } = {})
    {
        /**
         * Base color of the stamp. Will be used if there's no embedded color data.
         */
        this.color = color

        /**
         * Whether or not a partially transparent pixels should build onto itsself in a single stroke.
         */
        this.preventSelfIntersection = preventSelfIntersection

        /**
         * If set to true, strokes that go off canvas right will loop back to canvas left.
         */
        this.allowOverflow = allowOverflow

        /**
         * If set to false, the stamp color will replace any existing pixel data. Otherwise, partially
         * transparent pixels will be blended with underlying image data.
         */
        this.blendAlpha = blendAlpha

        /**
         * The stamp image data.
         */
        this.data = data
    }
    
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {ImageData} imageData
     */
    _apply (x, y, imageData)
    {
        for (const coord of this.data) {
            this.putPixel(
                x + coord.x,
                y + coord.y,
                this.getColor(coord),
                imageData
            )
        }
    }

    apply (x, y, imageData)
    {
        this._apply(x, y, imageData)
        this.resetBurn()
    }

    putPixel (x, y, color, imageData)
    {
        if (this.isOutOfBounds(x, y, imageData)) return
        const i = this.coordsToIndex(x, y, imageData.width)
        if (!this.burn(i)) return

        if (this.blendAlpha === false || color.a >= 1) {
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

    burn (i)
    {
        if (this.preventSelfIntersection === false) return true
        if (!this._burned) this._burned = {}
        if (this._burned[i]) return false
        this._burned[i] = true
        return true
    }

    resetBurn ()
    {
        this._burned = null
    }

    /**
     * @param {{x: number, y:number}[]} path 
     * @param {ImageData} imageData 
     */
    applyToPath (path, imageData)
    {
        for (const { x, y } of path) {
            this._apply(x, y, imageData)
        }
        this.resetBurn()
    }

    /**
     * @param {StampDatum} datum 
     * @returns {Color}
     */
    getColor (datum)
    {
        let color = datum.color || this.color || Color.Black
        if (!datum.a) return color
        return color.set('a', color.a * datum.a)
    }

    coordsToIndex (x, y, w)
    {
        return (y * w + x) * 4
    }
    
    isOutOfBounds (x, y, imageData)
    {
        if (this.allowOverflow) return false
        return x < 0 || y < 0 || x >= imageData.width || y >= imageData.height
    }
}