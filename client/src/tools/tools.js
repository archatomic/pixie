import { TOOL } from 'Pixie/constants'

import { Eraser } from './Eraser'
import { Fill } from './Fill'
import { Pan } from './Pan'
import { Pencil } from './Pencil'
import { Zoom } from './Zoom'

export const tools = {
    [TOOL.PENCIL]: Pencil,
    [TOOL.ERASER]: Eraser,
    [TOOL.FILL]: Fill,
    [TOOL.ZOOM]: Zoom,
    [TOOL.PAN]: Pan,
}