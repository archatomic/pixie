import { Application } from 'Pixie/Model/Application'
import { PixieCel } from 'Pixie/Model/PixieCel'
import { PixieFragment } from 'Pixie/Model/PixieFragment'
import { PixieFrame } from 'Pixie/Model/PixieFrame'
import { PixieLayer } from 'Pixie/Model/PixieLayer'
import { Record } from './Record'
import { Tab } from 'Pixie/Model/Tab'
import { ToolBox } from 'Pixie/Model/ToolBox'
import { UndoManager } from 'Pixie/Model/UndoStack'
import { Player } from 'Pixie/Model/Player'

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

    /** @type {import('./Record').RecordCollectionInstance<Player>} */
    players: Player.Collection.create(),

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
