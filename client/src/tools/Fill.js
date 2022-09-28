import { BaseTool } from './BaseTool'
import { fragmentActions } from 'client/store/actions/applicationActions'
import { locate } from 'client/util/registry'
import { TOOLOPT } from 'client/constants'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('client/model/Application').Application} Application
 */

export class Fill extends BaseTool
{
    /**
     * @param {ToolData} data 
     */
    end (data)
    {
        /** @type {import('client/model/Application').Application} */
        const application = locate('store').getState().get('application')
        this.tab = application.getActiveTab()
        this.fragment = application.getActiveFragment()
        this.color = application.toolbox.getOption(TOOLOPT.COLOR).getChannels()

        if (this.color[3] === 0) return // Early bail, no alpha means no op

        this.cel = this.fragment.getCel(this.tab.layer, this.tab.frame)
        if (this.cel.null) {
            this.cel = this.fragment.newCel()
            this._img = this.cel.data
            this.imageData = this._img.data

            for (let i = 0; i < this.imageData.length; i += 4) {
                this.imageData[i    ] = this.color[0] 
                this.imageData[i + 1] = this.color[1] 
                this.imageData[i + 2] = this.color[2] 
                this.imageData[i + 3] = this.color[3] 
            }

            return this.persist()
        }

        const { x, y } = data
        this._img = this.cel.copyImageData()
        this.imageData = this._img.data
        this.targetColor = this.sample(x, y)

        if (this.matches(this.targetColor, this.color)) return // Matching color to target. No op.

        const stack = [{ x, y }]
        while (stack.length > 0) {
            const p = stack.pop()

            // Sanity check
            if (!this.inside(p.x, p.y)) continue

            // fill
            this.setColor(p.x, p.y, this.color)

            // above
            this.addToStack(p.x, p.y - 1, stack)

            // below
            this.addToStack(p.x, p.y + 1, stack)

            // left
            this.addToStack(p.x - 1, p.y, stack)

            // right
            this.addToStack(p.x + 1, p.y, stack)
        }

        this.persist()
    }

    addToStack (x, y, stack)
    {
        // Check out of bounds
        if (x < 0 || y < 0 || x >= this.cel.width || y >= this.cel.height) return

        // Check inside
        if (this.inside(x, y)) stack.push({ x, y })
    }

    setColor (x, y, color)
    {
        const i = this.cel.coordsToIndex(x, y)
        this.imageData[i] = color[0]
        this.imageData[i + 1] = color[1]
        this.imageData[i + 2] = color[2]
        this.imageData[i + 3] = color[3]
    }

    sample (x, y)
    {
        const i = this.cel.coordsToIndex(x, y)
        return [
            this.imageData[i],
            this.imageData[i + 1],
            this.imageData[i + 2],
            this.imageData[i + 3]
        ]
    }

    matches (a, b)
    {
        return a[0] === b[0]
            && a[1] === b[1]
            && a[2] === b[2]
            && a[3] === b[3]
    }

    inside (x, y)
    {
        return this.matches(
            this.targetColor,
            this.sample(x, y)
        )
    }

    persist ()
    {
        fragmentActions.save(
            this.fragment.saveCel(
                this.tab.layer,
                this.tab.frame,
                this.cel.set('data', this._img)
            ),
            { history: this.constructor.name }
        )
    }
}