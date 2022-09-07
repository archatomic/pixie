import { TOOL_ERASER, TOOL_FILL, TOOL_PAN, TOOL_PENCIL, TOOL_ZOOM } from 'client/constants'

import { Eraser } from './Eraser'
import { Fill } from './Fill'
import { Pan } from './Pan'
import { Pencil } from './Pencil'
import { Zoom } from './Zoom'

export const tools = {
    [TOOL_PENCIL]: Pencil,
    [TOOL_ERASER]: Eraser,
    [TOOL_FILL]: Fill,
    [TOOL_ZOOM]: Zoom,
    [TOOL_PAN]: Pan,
}