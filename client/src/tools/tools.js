import { TOOL_ERASER, TOOL_PENCIL } from 'client/constants'

import { Eraser } from './Eraser'
import { Pencil } from './Pencil'

export const tools = {
    [TOOL_PENCIL]: Pencil,
    [TOOL_ERASER]: Eraser
}