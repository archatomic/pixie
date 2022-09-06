import { fragmentActions, tabActions } from 'client/store/actions/applicationActions'

import { BaseTool } from './BaseTool'
import { locate } from 'client/util/registry'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('client/model/Application').Application} Application
 */

export class Pan extends BaseTool
{
    start (_, { clientX, clientY })
    {
        /** @type {import('client/model/Application').Application} */
        const application = locate('store').getState().get('application')
        this.initialTab = application.getActiveTab()
        this.tab = this.initialTab
        this.startX = clientX
        this.startY = clientY
    }

    move (_, { clientX, clientY })
    {
        const deltaX = clientX - this.startX
        const deltaY = clientY - this.startY
        this.tab = this.tab.merge({
            x: this.initialTab.x + deltaX,
            y: this.initialTab.y + deltaY
        })
        this.persist()
    }

    end (data, e)
    {
        this.move(data, e)
    }

    cancel ()
    {
        this.tab = this.initialTab
        this.persist()
    }

    persist ()
    {
        tabActions.save(this.tab)
    }
}