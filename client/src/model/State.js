import { Application } from 'client/model/Application'
import { PixieCel } from 'client/model/PixieCel'
import { PixieFragment } from 'client/model/PixieFragment'
import { PixieFrame } from 'client/model/PixieFrame'
import { PixieLayer } from 'client/model/PixieLayer'
import { Record } from './Record'
import { Tab } from 'client/model/Tab'
import { ToolBox } from 'client/model/ToolBox'
import { UndoManager } from 'client/model/UndoStack'

export class State extends Record({
    /**
     * @type {Application}
     */
    application: Application.create(),

    /**
     * @type {UndoManager}
     */
    history: UndoManager.create(),

    /**
     * @type {ToolBox}
     */
    toolbox: ToolBox.create(),

    /** @type {import('./Record').RecordCollectionInstance<PixieFragment>} */
    fragments: PixieFragment.Collection.create(),

    /** @type {import('./Record').RecordCollectionInstance<PixieLayer>} */
    layers: PixieLayer.Collection.create(),

    /** @type {import('./Record').RecordCollectionInstance<PixieFrame>} */
    frames: PixieFrame.Collection.create(),

    /** @type {import('./Record').RecordCollectionInstance<PixieCel>} */
    cels: PixieCel.Collection.create(),

    /** @type {import('./Record').RecordCollectionInstance<Tab>} */
    tabs: Tab.Collection.create(),
}) {
    /**
     * Lookup a tab. If no tabID is provided, will lookup the application's
     * currently active tab.
     *
     * @param {string} [tabID]
     *
     * @returns {Tab}
     */
    getTab (tabID = null)
    {
        if (tabID instanceof Tab) return tabID
        if (!tabID) tabID = this.application.activeTab
        return this.tabs.find(tabID)
    }

    /**
     * Lookup a fragment. If no fragmentID is provided, will lookup the fragment in
     * the currently active tab.
     *
     * @param {string} [fragmentID]
     *
     * @returns {PixieFragment}
     */
    getFragment (fragmentId = null)
    {
        if (fragmentId instanceof PixieFragment) return fragmentId
        if (!fragmentId) fragmentId = this.getTab().fragment
        return this.fragments.find(fragmentId)
    }

    sanitize ()
    {
        let op = this
        this.cels.forEach(cel =>
        {
            op = op.delegateSet('cels', 'add', cel.sanitize())
        })

        op = op.set('history', op.history.sanitize())
        return op
    }
}
