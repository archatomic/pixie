import { celActions } from 'Pixie/store/actions/applicationActions'

import { BaseTool } from './BaseTool'
import { locate } from 'Pixie/util/registry'
import { getCircleBrush } from 'Pixie/Model/Brush/getCircleBrush'
import { TOOLOPT } from 'Pixie/constants'
import { DrawJob } from 'Pixie/util/DrawJob'
import { Operation } from 'Pixie/store/operations'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('Pixie/Model/Application').Application} Application
 * @typedef {import('Pixie/Model/State').State} State
 */

export class Pencil extends BaseTool
{
    /**
     * @type {State}
     */
    get state ()
    {
        return locate('state')
    }

    get application ()
    {
        return this.state.application
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
        if (!this.job) return
        this.job.lineTo(data.x, data.y)
        this.job.update()
        this.updateToolCel()
    }

    end (data)
    {
        if (!this.job) return
        this.job.lineTo(data.x, data.y)
        this.job.commit()
        this.persist()
        this.job.reset()
    }

    cancel ()
    {
        celActions.save(this.cel.clearPreview())
        this.job.reset()
    }

    persist ()
    {
        celActions.save(
            this.cel.set(
                'data',
                this.job.result
            ).clearPreview()
        )

        Operation.pushHistory(
            this.cel.fragment,
            this.constructor.name
        )
    }

    updateToolCel ()
    {
        celActions.save(
            this.cel.showPreview(
                this.job.preview,
                !this.drawOpts?.previewIncludesTarget
            )
        )
    }

    cursor ()
    {
        return this.brush
    }
}
