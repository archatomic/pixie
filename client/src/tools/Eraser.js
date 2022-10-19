import { Pencil } from './Pencil'
import { BLENDMODE, TOOLOPT } from 'Pixie/constants'
import { Color } from 'Pixie/model/Color'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('Pixie/model/Application').Application} Application
 */

export class Eraser extends Pencil
{
    get size ()
    {
        return this.application.toolbox.getOption(TOOLOPT.ERASER_SIZE)
    }

    drawOpts = {
        color: Color.Transparent,
        blendmode: BLENDMODE.REPLACE,
        pixelPerfect: false,
        previewIncludesTarget: true
    }
}