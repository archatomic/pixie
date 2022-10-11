import { Pencil } from './Pencil'
import { BLENDMODE, TOOLOPT } from 'client/constants'
import { Color } from 'client/model/Color'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('client/model/Application').Application} Application
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