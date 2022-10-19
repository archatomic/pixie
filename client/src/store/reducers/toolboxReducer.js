import {
    TOOLBOX_ACTIVATE,
    TOOLBOX_OPTION_SET,
    TOOLBOX_REGISTER_TOOL
} from 'Pixie/store/actions/toolboxActions'

import { ToolBox } from 'Pixie/Model/ToolBox'

/** @type {ToolBox} */
const INITIAL_STATE = ToolBox.create()

export const toolboxReducer = (toolbox = INITIAL_STATE, action = {}, globalState = null) =>
{
    switch (action.type) {
        case TOOLBOX_ACTIVATE:
            return toolbox.activate(action.payload)
        case TOOLBOX_OPTION_SET:
            return toolbox.setOption(action.payload.key, action.payload.value)
        case TOOLBOX_REGISTER_TOOL:
            return toolbox.registerTool(action.payload.id, action.payload.options)
    }

    return toolbox
}
