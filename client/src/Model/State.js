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
    load (fileData)
    {
        let op = this
        for (const key of Object.keys(fileData)) {
            op = op.delegateSet(key, 'addAll', fileData[key])
        }
        return op
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
