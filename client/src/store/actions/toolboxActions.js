import { action } from 'client/util/action'

export const TOOLBOX_ACTIVATE = 'toolbox.tool.activate'
export const activateTool = (tool) => action(TOOLBOX_ACTIVATE, tool)

export const TOOLBOX_OPTION_SET = 'toolbox.option.set'
export const setToolOption = (key, value) => action(TOOLBOX_OPTION_SET, { key, value })

export const TOOLBOX_REGISTER_TOOL = 'toolbox.tool.register'
export const registerTool = (id, options) => action(TOOLBOX_REGISTER_TOOL, { id, options })


