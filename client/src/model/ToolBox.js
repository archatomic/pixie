import { TOOL } from 'Pixie/constants'
import { Record } from 'Pixie/Model/Record'
import { Map, List } from 'immutable'

/**
 * @typedef {any|{id: any, name: string}} ToolOptionProps
 */

/**
 * @typedef {{id: any, name: string}} ToolOption
 */

/**
 * @typedef {object} ToolProps
 *
 * @property {string} [name='Tool']
 * @property {string|null} [icon = null]
 * @property {ToolOptionProps[]} [options = []]
 */

class Tool extends Record({
    name: 'Tool',
    icon: null,
    /** @type {List<ToolOption>} */
    options: List(),
}) { }

export class ToolBox extends Record({
    /** @type {Map<any, Tool>} */
    tools: Map(),
    active: TOOL.PENCIL,
    options: Map()
}) {
    get tool ()
    {
        return this.getTool(this.active)
    }

    getTool (tool)
    {
        const _tool = this.tools.get(tool, Tool.Null)
        const op = _tool.toData()
        op.id = _tool.pk
        op.options = this.getToolOptions(tool)
        return op
    }

    getToolOptions (tool)
    {
        const _tool = this.tools.get(tool, Tool.Null)
        const options = []
        _tool.options.forEach(({ id, name }) => options.push(
            {
                id,
                name: name || `${id}`,
                value: this.getOption(id)
            }
        ))
        return options
    }

    hasTool (tool)
    {
        return this.tools.has(tool)
    }

    activate (tool)
    {
        return this.set('active', tool)
    }

    /**
     * @param {string|int} id Corresponds to the TOOL constants.js enum
     * @param {ToolProps} [opts]
     * @returns {ToolBox}
     */
    registerTool (id, { name, icon, options = [] } = {})
    {
        const tool = Tool.create({
            _id: id,
            name,
            icon,
            options: List(options.map(this.normalizeToolOption))
        })
        return this.setIn(['tools', id], tool)
    }

    /**
     * @param {ToolOptionProps} toolOption
     * @returns {ToolOption}
     */
    normalizeToolOption (toolOption)
    {
        const id = toolOption.id || toolOption
        const name = toolOption.name || `${id}`
        return { id, name }
    }

    setOption (name, value)
    {
        return this.setIn(['options', name], value)
    }

    getOption (name, fallback = undefined)
    {
        return this.getIn(['options', name], fallback)
    }
}
