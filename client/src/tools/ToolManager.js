/**
 * @typedef {object} ToolData
 * @property {number} x
 * @property {number} y
 * @property {number} startX
 * @property {number} startY
 * @property {number} deltaX
 * @property {number} deltaX
 * @property {number} prevX
 * @property {number} prevY
 */

import { BaseTool } from './BaseTool'
import { tools } from './tools'

/**
 * @typedef {import('./BaseTool').BaseTool} BaseTool
 */

export class ToolManager
{
    /**
     * @type {BaseTool | null}
     */
    tool = null

    /**
     * @type {ToolData | null}
     */
    data = null

    event = null

    active = false

    get inactive ()
    {
        return !this.active
    }

    setTool (tool)
    {
        if (tool === this.toolName) return

        const old = {
            data: this.data,
            tool: this.tool,
            event: this.event
        }
    
        if (this.active) this.tool.end(this.data, this.event)

        this.tool = this.getTool(tool)
        this.toolName = this.getToolName(tool)

        return old
    }

    /**
     * @param {BaseTool | string} tool
     * @param {number} x 
     * @param {number} y 
     */
    start (tool, x, y, event)
    {
        const old = this.setTool(tool)

        if (!this.tool) return

        this.data = {
            x,
            y,
            startX: x,
            startY: y,
            prevX: x,
            prevY: y,
            deltaX: 0,
            deltaY: 0
        }

        this.tool.start(this.data, event, old)

        this.event = event

        this.active = true
    }

    getTool (tool)
    {
        if (tool instanceof BaseTool) return tool
        const Constructor = tools[tool]
        if (!Constructor) return null
        return Constructor.create()
    }

    getToolName (tool)
    {
        if (tool instanceof BaseTool === false) return tool
        for (const key of Object.keys(tools)) {
            if (tool instanceof tools[key]) return key
        }
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    move (x, y, event)
    {
        if (this.inactive) return
        this.event = event
        this.data.deltaX = x - this.data.prevX
        this.data.deltaY = y - this.data.prevY
        this.data.prevX = this.data.x
        this.data.prevY = this.data.y
        this.data.x = x
        this.data.y = y
        this.tool.move(this.data, event)
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    end (x, y, event)
    {
        if (this.inactive) return
        this.data.deltaX = x - this.data.prevX
        this.data.deltaY = y - this.data.prevY
        this.data.prevX = this.data.endX
        this.data.prevY = this.data.endY
        this.data.x = x
        this.data.y = y
        this.tool.end(this.data, event)
        this.reset()
    }

    cancel ()
    {
        if (this.inactive) return
        this.tool.cancel()
        this.reset()
    }

    cursor ()
    {
        if (!this.tool) return 'auto'
        return this.tool.cursor()
    }

    reset ()
    {
        /* this.data = null
        this.tool = null
        this.toolName = null */
        this.event = null
        this.active = false
    }
}
