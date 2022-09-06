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

    get active ()
    {
        return this.tool !== null && this.data !== null
    }

    get inactive ()
    {
        return !this.active
    }

    /**
     * @param {BaseTool | string} tool
     * @param {number} x 
     * @param {number} y 
     */
    start (tool, x, y)
    {
        if (this.active) this.cancel()

        this.tool = this.getTool(tool)

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

        this.tool.start(this.data)
    }

    getTool (tool)
    {
        if (tool instanceof BaseTool) return tool
        const Constructor = tools[tool]
        if (!Constructor) return null
        return Constructor.create()
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    move (x, y)
    {
        if (this.inactive) return
        this.data.deltaX = x - this.data.prevX
        this.data.deltaY = y - this.data.prevY
        this.data.prevX = this.data.x
        this.data.prevY = this.data.y
        this.data.x = x
        this.data.y = y
        this.tool.move(this.data)
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    end (x, y)
    {
        if (this.inactive) return
        this.data.deltaX = x - this.data.prevX
        this.data.deltaY = y - this.data.prevY
        this.data.prevX = this.data.endX
        this.data.prevY = this.data.endY
        this.data.x = x
        this.data.y = y
        this.tool.end(this.data)
        this.reset()
    }

    cancel ()
    {
        if (this.inactive) return
        this.tool.cancel()
        this.reset()
    }

    reset ()
    {
        this.data = null
        this.tool = null
    }
}
