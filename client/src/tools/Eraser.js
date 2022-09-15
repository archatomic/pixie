import { Color } from 'client/model/Color'
import { Pencil } from './Pencil'
import { Stamp } from './Stamp'
import { tabActions } from 'client/store/actions/applicationActions'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('client/model/Application').Application} Application
 */

export class Eraser extends Pencil
{
    getBrush ()
    {
        return new Stamp({
            color: Color.Transparent,
            blendAlpha: false,
            data: [{x: 0, y: 0},{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1}]
        })
    }

    drawPixel (x, y)
    {
        const last = this.pixels[this.pixels.length - 1]
        if (last.x === x && last.y === y) return
        this.pixels.push({ x, y })
    }

    cancel ()
    {
        tabActions.save(this.tab.clearToolCel())
    }

    getImageData (cel = this.cel)
    {
        return this.writeImageData(cel)
    }

    updateToolCel ()
    {
        this.tab = this.tab.updateToolCel(this.getImageData(), true)
        tabActions.save(this.tab)
    }
}