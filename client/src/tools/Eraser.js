import { Pencil } from './Pencil'
import { tabActions } from 'client/store/actions/applicationActions'
import { BLENDMODE, TOOLOPT } from 'client/constants'
import { Color } from 'client/model/Color'
import { DrawJob } from 'client/util/DrawJob'

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