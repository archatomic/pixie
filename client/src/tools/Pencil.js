import { fragmentActions, tabActions } from 'client/store/actions/applicationActions'

import { BaseTool } from './BaseTool'
import { locate } from 'client/util/registry'
import { getCircleBrush } from 'client/model/brushes/circle'
import { TOOLOPT } from 'client/constants'
import { DrawJob } from 'client/util/DrawJob'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('client/model/Application').Application} Application
 */

export class Pencil extends BaseTool
{
    /**
     * @type {Application}
     */
    get application ()
    {
        return locate('store').getState().get('application')
    }

    get tab ()
    {
        return this.application.getActiveTab()
    }

    get fragment ()
    {
        return this.application.getActiveFragment()
    }

    get size ()
    {
        return this.application.toolbox.getOption(TOOLOPT.PENCIL_SIZE)
    }

    get color ()
    {
        return this.application.toolbox.getOption(TOOLOPT.COLOR)
    }

    get brush ()
    {
        return getCircleBrush(this.size)
    }

    /**
     * @param {ToolData} data 
     */
    start (data)
    {
        this.cel = this.fragment.getCel(this.tab.layer, this.tab.frame)

        if (this.cel.null) this.cel = this.fragment.newCel()

        this.job = this.createJob()
        this.job.bind(this.cel.data)
        this.job.addToPath(data.x, data.y)
        this.job.update()

        this.updateToolCel()
    }

    createJob ()
    {
        return DrawJob.create({
            brush: this.brush,
            color: this.color,
            ...this.drawOpts
        })
    }

    /**
     * @param {ToolData} data 
     */
    move (data)
    {
        this.job.lineTo(data.x, data.y)
        this.job.update()
        this.updateToolCel()
    }

    end (data)
    {
        this.job.lineTo(data.x, data.y)
        this.job.commit()
        this.persist()
        this.job.reset()
    }

    cancel ()
    {
        tabActions.save(this.tab.clearToolCel())
        this.job.reset()
    }

    persist ()
    {
        tabActions.save(this.tab.clearToolCel())
        
        const fragment = this.fragment.saveCel(
            this.tab.layer,
            this.tab.frame,
            this.cel.set(
                'data',
                this.job.result
            )
        )
        
        fragmentActions.save(fragment, { history: this.constructor.name })
    }

    updateToolCel ()
    {
        const imageData = this.job.preview
        const tab = this.tab.updateToolCel(imageData, this.drawOpts?.previewIncludesTarget)
        tabActions.save(tab)
    }

    cursor ()
    {
        return this.brush
    }
}