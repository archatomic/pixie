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
    application: Application.create(),
    history: UndoManager.create(),
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
}) { }
