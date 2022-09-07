import { fragmentActions, tabActions } from 'client/store/actions/applicationActions'

import { BaseTool } from './BaseTool'
import { lerp } from 'client/util/clamp'
import { locate } from 'client/util/registry'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('client/model/Application').Application} Application
 */

export class Pencil extends BaseTool
{
    /**
     * @param {ToolData} data 
     */
    start (data)
    {
        /**
         * @type {Application}
         */
        const application = locate('store').getState().get('application')
        if (!this.tab) this.tab = application.getActiveTab()
        if (!this.fragment) this.fragment = application.getActiveFragment()
        this.color = [0, 0, 0, 255]

        // TODO: For pencil, and eraser
        // this.brush = {
        //     width: 1,
        //     height: 1,
        //     data: [1]
        // }

        this.cel = this.fragment.getCel(this.tab.layer, this.tab.frame)

        if (this.cel.null) this.cel = this.fragment.newCel()

        this.pixels = [{ x: data.x, y: data.y }]
        
        this.updateToolCel()
    }

    /**
     * @param {ToolData} data 
     */
    move (data)
    {
        this.drawLine(data.prevX, data.prevY, data.x, data.y)
        this.updateToolCel()
    }

    end (data)
    {
        this.drawLine(data.prevX, data.prevY, data.x, data.y)
        this.persist()
    }

    persist ()
    {
        tabActions.save(this.tab.clearToolCel())
        
        const fragment = this.fragment.saveCel(
            this.tab.layer,
            this.tab.frame,
            this.cel.set(
                'data',
                this.writeImageData()
            )
        )
        
        fragmentActions.save(fragment)
    }

    cancel ()
    {
        tabActions.save(this.tab.clearToolCel())
    }

    drawPixel (x, y)
    {
        const p2 = { x, y }
        const p1 = this.pixels[this.pixels.length - 1]
        const p0 = this.pixels[this.pixels.length - 2]

        if (p1.x === p2.x && p1.y === p2.y) return // Dedupe

        if (!p0) return this.pixels.push(p2) // No work needed

        const flat = (p0.x === p1.x || p0.y === p1.y)
            ? p0
            : (p2.x === p1.x || p2.y === p1.y)
            ? p2
            : null
    
        if (!flat) return this.pixels.push(p2) // Both pixels are diagonals. No risk of chunking.

        const diag = (p0.x !== p1.x && p0.y !== p1.y)
            ? p0
            : (p2.x !== p1.x && p2.y !== p1.y)
            ? p2
            : null
        
        if (!diag) {
            // Both pixels are flats. Check if this is a hard right angle.
            if (p0.x !== p2.x && p0.y !== p2.y) return this.dechunk(x, y)
            return this.pixels.push(p2) // Both pixels are flats. No risk of chunking.
        }

        if (flat.x !== diag.x && flat.y !== diag.y) // Only valid diagonals don't match x and y
            return this.pixels.push(p2)

        this.dechunk(x, y)
    }

    dechunk (x, y)
    {
        this.pixels.pop()
        this.drawPixel(x, y)
    }

    drawLine (x1, y1, x2, y2)
    {
        const numPixels = Math.max(Math.abs(y2 - y1), Math.abs(x2 - x1)) + 1
        
        for (let i = 0; i <= numPixels; i++) {
            const t = i / numPixels
            const x = Math.round(lerp(x1, x2, t))
            const y = Math.round(lerp(y1, y2, t))
            this.drawPixel(x, y)
        }
    }

    getImageData (cel = this.cel)
    {
        this.imageData = cel.createBlankImageData()

        for (const p of this.pixels) {
            const i = cel.coordsToIndex(p.x, p.y)
            this.imageData.data[i] = this.color[0]
            this.imageData.data[i + 1] = this.color[1]
            this.imageData.data[i + 2] = this.color[2]
            this.imageData.data[i + 3] = this.color[3]
        }

        return this.imageData
    }

    writeImageData (cel = this.cel)
    {
        const data = cel.data?.data || cel.createBlankImageData()
        const [br, bg, bb, _ba] = this.color

        const ba = _ba / 255

        // Full opacity: write the color directly
        if (ba >= 1) {
            for (const p of this.pixels) {
                const i = cel.coordsToIndex(p.x, p.y)
                data[i    ] = br
                data[i + 1] = bg
                data[i + 2] = bb
                data[i + 3] = 255
            }
            return new ImageData(data, cel.width, cel.height)
        }

        // Blend the colors
        for (const p of this.pixels) {
            const i = cel.coordsToIndex(p.x, p.y)

             // Todo: pull color math out into a util / class
            const ar = data[i]
            const ag = data[i + 1]
            const ab = data[i + 2]
            const aa = data[i + 3] / 255

            const a = aa + ba * (1 - aa)
            const r = (ar * aa + br * ba * (1 - aa)) / a
            const g = (ag * aa + bg * ba * (1 - aa)) / a
            const b = (ab * aa + bb * ba * (1 - aa)) / a
            
            data[i    ] = r
            data[i + 1] = g
            data[i + 2] = b
            data[i + 3] = a * 255
        }

        return new ImageData(data, cel.width, cel.height)
    }

    updateToolCel ()
    {
        this.tab = this.tab.updateToolCel(this.getImageData())
        tabActions.save(this.tab)
    }
}