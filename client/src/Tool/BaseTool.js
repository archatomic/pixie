/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 */

/**
 * @typedef {ImageData|string} CursorData
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

    /**
     * @param {CursorData} data 
     */
    cursor () { return 'auto' }
}