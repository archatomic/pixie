import { TOOL_ERASER, TOOL_FILL, TOOL_PENCIL } from 'client/constants'

import { Eraser } from './Eraser'
import { Fill } from './Fill'
import { Pencil } from './Pencil'

export const tools = {
    [TOOL_PENCIL]: Pencil,
    [TOOL_ERASER]: Eraser,
    [TOOL_FILL]: Fill,
}