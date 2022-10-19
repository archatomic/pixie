import { OVERFLOW, BLENDMODE } from 'Pixie/constants'
import { getCircleBrush } from 'Pixie/Model/Brush/getCircleBrush'
import { lerp } from 'Pixie/util/math'

/**
 * @typedef {import('Pixie/Model/SparseImage').SparseImage} SparseImage
 * @typedef {import('Pixie/Model/Color').Color} Color
 */

/**
 * @typedef {object} DrawJobOptions
 * @property {Color} [color]
 * @property {boolean} [preventSelfIntersection=true]
 * @property {boolean} [pixelPerfect=true]
 * @property {boolean} [previewIncludesTarget=false]
 * @property {*} [overflow=OVERFLOW.NONE]
 * @property {*} [blendmode=BLENDMODE.ALPHA]
 * @property {SparseImage} [brush]
 */

/**
 * @typedef {object} PathData
 * @property {number} x
 * @property {number} y
 */

const DEFAULT_BRUSH = getCircleBrush(1)

export class DrawJob
{
    /**
     * @param {DrawJobOptions} options
     * @returns {DrawJob}
     */
    static create (options)
    {
        return new this(options)
    }
    /**
     * @param {DrawJobOptions} options
     */
    constructor({
        color = null,
        preventSelfIntersection = true,
        pixelPerfect = true,
        previewIncludesTarget = false,
        overflow = OVERFLOW.NONE,
        blendmode = BLENDMODE.ALPHA,
        brush = DEFAULT_BRUSH
    } = {})
    {
        /**
         * @type {Color|null}
         */
        this.color = color

        /**
         * @type {boolean}
         */
        this.preventSelfIntersection = preventSelfIntersection

        /**
         * @type {boolean}
         */
        this.pixelPerfect = pixelPerfect

        /**
         * @type {boolean}
         */
        this.previewIncludesTarget = previewIncludesTarget

        /**
         * @type {any}
         */
        this.overflow = overflow

        /**
         * @type {any}
         */
        this.blendmode = blendmode

        /**
         * @type {SparseImage}
         */
        this.brush = brush

        /**
         * @type {ImageData | null}
         */
        this.target = null

        /**
         * @type {ImageData | null}
         */
        this.preview = null

        /**
         * @type {Object<number|true>}
         */
        this._burnt = {}

        /**
         * @type {ImageData | null}
         */
        this.committed = null

        /**
         * @type {Object<number|true>}
         */
        this._cburnt = {}

        /**
         * @type {ImageData | null}
         */
        this.result = null

        /**
         * @type {PathData[]}
         */
        this.path = []

        /**
         * @type {number}
         * @todo
         */
        this.maxPathLength = 3
    }

    bind (imageData)
    {
        if (this.target) throw new Error('Cannot bind image to job: Job already managing another image.')
        if (imageData.job) throw new Error('Cannot bind image to job: Image already bound.')
        this.target = imageData
        this.preview = new ImageData(imageData.width, imageData.height)
        this.committed = new ImageData(imageData.width, imageData.height)
        if (this.previewIncludesTarget) this.committed.data.set(this.target.data)
    }

    unbind ()
    {
        if (this.target) this.target.job = null
        this.target = null
        this.preview = null
        this.committed = null
        this._burnt = {}
        this._cburnt = {}
    }

    reset ()
    {
        this.unbind()
        this.path = []
    }

    /**
     * Add a pixel to the path. Handles the pixel perfect algorithm.
     *
     * @param {number} x
     * @param {number} y
     */
    addToPath (x, y)
    {
        const p2 = { x, y }
        const p1 = this.path[this.path.length - 1]
        const p0 = this.path[this.path.length - 2]

        if (!p1) return this.path.push(p2) // No work needed

        if (p1.x === p2.x && p1.y === p2.y) return // Dedupe

        if (!p0 || !this.pixelPerfect) return this.path.push(p2) // No work needed

        const flat = (p0.x === p1.x || p0.y === p1.y)
            ? p0
            : (p2.x === p1.x || p2.y === p1.y)
            ? p2
            : null

        if (!flat) return this.path.push(p2) // Both pixels are diagonals. No risk of chunking.

        const diag = (p0.x !== p1.x && p0.y !== p1.y)
            ? p0
            : (p2.x !== p1.x && p2.y !== p1.y)
            ? p2
            : null

        if (!diag) {
            // Both pixels are flats. Check if this is a hard right angle.
            if (p0.x !== p2.x && p0.y !== p2.y) return this.dechunk(x, y)
            return this.path.push(p2) // Both pixels are flats. No risk of chunking.
        }

        if (flat.x !== diag.x && flat.y !== diag.y) // Only valid diagonals don't match x and y
            return this.path.push(p2)

        this.dechunk(x, y)
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    dechunk (x, y)
    {
        this.path.pop()
        this.addToPath(x, y)
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    lineTo (x, y)
    {
        const p = this.path[this.path.length - 1]
        if (!p) return this.addToPath(x, y)
        const x1 = p.x
        const y1 = p.y
        const x2 = x
        const y2 = y

        const numPixels = Math.max(Math.abs(y2 - y1), Math.abs(x2 - x1)) + 1

        for (let i = 0; i <= numPixels; i++) {
            const t = i / numPixels
            const x = Math.round(lerp(x1, x2, t))
            const y = Math.round(lerp(y1, y2, t))
            this.addToPath(x, y)
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    coordsToIndex (x, y)
    {
        if (this.overflow === OVERFLOW.NONE) {
            if (x < 0) return -1
            if (y < 0) return -1
            if (x >= this.target.width) return -1
            if (y >= this.target.height) return -1
        }

        if (this.overflow === OVERFLOW.REPEAT) {
            x = x % this.target.width
            y = y % this.target.height
        }

        return (y * this.target.width + x) * 4
    }

    /**
     * @param {number} i
     * @returns {boolean}
     */
    shouldSkip (i)
    {
        if (this.isPixelBurnt(i)) return true
        if (!this.target) return true
        if (i < 0) return true
        return false
    }

    applyBrushToPoint (p, imageData)
    {
        this.brush.forEach((x, y, color) =>
        {
            if (this.color) color = this.color.set('a', color.a * this.color.a)
            this.drawPixel(x + p.x, y + p.y, color, imageData)
        })
    }

    drawPixel (x, y, color, imageData)
    {
        const i = this.coordsToIndex(x, y)
        if (this.shouldSkip(i)) return
        this._burnt[i] = true
        this.drawPixelByIndex(i, color.R, color.G, color.B, color.A, imageData)
    }

    drawPixelByIndex (i, r, g, b, a, imageData)
    {
        if (this.blendmode === BLENDMODE.REPLACE || a >= 255) {
            // Direct copy
            imageData.data[i    ] = r
            imageData.data[i + 1] = g
            imageData.data[i + 2] = b
            imageData.data[i + 3] = a
            return
        }

        // Blend color
        const ar = r // 0 - 255 red
        const ag = g // 0 - 255 green
        const ab = b // 0 - 255 blue
        const aa = a / 255 // 0 - 1 alpha

        const br = imageData.data[i]           // 0 - 255 red
        const bg = imageData.data[i + 1]       // 0 - 255 green
        const bb = imageData.data[i + 2]       // 0 - 255 blue
        const ba = imageData.data[i + 3] / 255 // 0 - 1 alpha

        const ca = aa + ba * (1 - aa)
        const cr = (ar * aa + br * ba * (1 - aa)) / ca
        const cg = (ag * aa + bg * ba * (1 - aa)) / ca
        const cb = (ab * aa + bb * ba * (1 - aa)) / ca

        imageData.data[i    ] = cr
        imageData.data[i + 1] = cg
        imageData.data[i + 2] = cb
        imageData.data[i + 3] = ca * 255
    }

    isPixelBurnt (i)
    {
        if (!this.preventSelfIntersection) return false
        if (!this._burnt) return false
        return this._burnt[i] || this._cburnt[i]
    }

    burnPixel (i)
    {
        this._burnt[i] = true
    }

    update ()
    {
        // Update the committed image with the oldest points
        this._burnt = {}
        while (this.maxPathLength >= 0 && this.path.length > this.maxPathLength) {
            this.applyBrushToPoint(this.path.shift(), this.committed)
        }
        Object.assign(this._cburnt, this._burnt)

        // reset the preview from the committed dataset
        this.preview.data.set(this.committed.data)

        this._burnt = {}
        for (const p of this.path) {
            this.applyBrushToPoint(p, this.preview)
        }
    }

    commit ()
    {
        this.result = new ImageData(this.target.width, this.target.height)
        this.result.data.set(this.target.data)

        // Copy the preview into the result
        Object.assign(this._cburnt, this._burnt)
        for (const k of Object.keys(this._cburnt)) {
            const i = parseInt(k)
            this.drawPixelByIndex(
                i,
                this.preview.data[i],
                this.preview.data[i + 1],
                this.preview.data[i + 2],
                this.preview.data[i + 3],
                this.result
            )
        }
    }
}
