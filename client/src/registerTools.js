
import { registerTool, setToolOption } from 'Pixie/store/actions/toolboxActions'
import { Color } from 'Pixie/model/Color'

import { TOOL, TOOLOPT } from './constants'

export function registerTools () {
    // Set default options
    setToolOption(TOOLOPT.PENCIL_SIZE, 1)
    setToolOption(TOOLOPT.ERASER_SIZE, 2)
    setToolOption(TOOLOPT.COLOR, Color.Black)

    // Register Tools
    registerTool(TOOL.PENCIL, {
        name: 'Pencil',
        icon: 'pencil',
        options: [TOOLOPT.COLOR, TOOLOPT.PENCIL_SIZE]
    })

    registerTool(TOOL.ERASER, {
        name: 'Eraser',
        icon: 'eraser',
        options: [TOOLOPT.ERASER_SIZE]
    })

    registerTool(TOOL.FILL, {
        name: 'Fill',
        icon: 'fill-drip',
        options: [TOOLOPT.COLOR]
    })

    registerTool(TOOL.PAN, {
        name: 'Pan',
        icon: 'arrows-up-down-left-right'
    })

    registerTool(TOOL.ZOOM, {
        name: 'Pan',
        icon: 'magnifying-glass'
    })
}