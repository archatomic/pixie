import { Pencil } from './Pencil'
import { tabActions } from 'client/store/actions/applicationActions'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('client/model/Application').Application} Application
 */

export class Eraser extends Pencil
{
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
        const data = cel.data?.data || cel.createBlankImageData()
        for (const p of this.pixels) {
            const i = cel.coordsToIndex(p.x, p.y)
            data[i + 3] = 0
        }
        return new ImageData(data, cel.width, cel.height)
    }

    writeImageData (cel = this.cel)
    {
        return this.getImageData(cel)
    }

    updateToolCel ()
    {
        this.tab = this.tab.updateToolCel(this.getImageData(), true)
        tabActions.save(this.tab)
    }
}