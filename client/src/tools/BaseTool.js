/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 */

export class BaseTool
{
    static create ()
    {
        return new this()
    }

    /**
     * @param {ToolData} data 
     */
    start (data) { }

    /**
     * @param {ToolData} data 
     */
    move (data) { }

    /**
     * @param {ToolData} data 
     */
    end (data) { }

    cancel () { }
}