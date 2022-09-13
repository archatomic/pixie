import { clamp, mod } from 'client/util/math'

import { Record } from './Record'

const BRIGHTNESS_THRESHOLD = 0.5

export class Color extends Record({
    r: 0,
    g: 0,
    b: 0,
    a: 1
}) {
    static create (r, g, b, a = 1)
    {
        return new this({r, g, b, a})
    }

    static Black = this.create(0, 0, 0)
    static White = this.create(1, 1, 1)

    /**
     * Return the 0 - 255 value of the red channel
     *
     * @type {Number}
     */
    get R ()
    { return this.getChannel('r') }
    
    /**
     * Return the 0 - 255 value of the green channel
     *
     * @type {Number}
     */
    get G ()
    { return this.getChannel('g') }

    /**
     * Return the 0 - 255 value of the blue channel
     *
     * @type {Number}
     */
    get B ()
    { return this.getChannel('b') }

    /**
     * Return the 0 - 255 value of the alpha channel
     *
     * @type {Number}
     */
    get A ()
    { return this.getChannel('a') }

    getCSS ({ r = this.R, g = this.G, b = this.B, a = this.a } = {})
    { return `rgba(${r}, ${g}, ${b}, ${a})` }
    
    getChannel (channel)
    { return Math.floor(clamp(this.get(channel, 0) * 256, 0, 255)) }

    getChannels ()
    { return [this.R, this.G, this.B, this.A] }

    isBright ()
    {
        return this.getHSL().l > BRIGHTNESS_THRESHOLD
    }

    getHSL ()
    {
        const r = this.r
        const g = this.g
        const b = this.b
        const cMax = Math.max(r, g, b)
        const cMin = Math.min(r, g, b)
        const delta = cMax - cMin
        const l = (cMax + cMin) / 2
        
        if (delta === 0) return { h: 0, s: 0, l }
        

        const h = 60 * (
            cMax === r ?
                mod((g - b) / delta, 6) :
            cMax === g ?
                ((b - r) / delta) + 2 :
            // cMax === b
                ((r - g) / delta) + 4
        )
 
        const s = delta / ( 1 - Math.abs(2 * l - 1))

        return {h, s, l}
    }

    setHSL (h, s, l)
    {
        const c = (1 - Math.abs(2 * l - 1)) * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = l - c/2
        const hPrime = Math.floor(h / 60)
        let rPrime = 0
        let gPrime = 0
        let bPrime = 0

        switch (hPrime) {
            case 0:
                rPrime = c
                gPrime = x
                break
            case 1:
                gPrime = c
                rPrime = x
                break
            case 2:
                gPrime = c
                bPrime = x
                break
            case 3:
                bPrime = c
                gPrime = x
                break
            case 4:
                bPrime = c
                rPrime = x
                break
            case 5:
                rPrime = c
                bPrime = x
                break
        }


        return this.merge({
            r: rPrime + m,
            g: gPrime + m,
            b: bPrime + m,
        })
    }
}