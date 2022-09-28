import { APP_NAME } from 'client/constants'
import { Color } from './Color'
import { PixieFragment } from './PixieFragment'
import { Record } from './Record'
import { Tab } from './Tab'
import { UndoManager } from './UndoStack'
import { getDefaultTheme } from 'client/util/theme'
import { locate } from 'client/util/registry'
import { ToolBox } from 'client/model/ToolBox'

export class Application extends Record({
    title: APP_NAME,
    focused: () => document.hasFocus(),
    safeArea: () => locate('safeArea', { top: 0, left: 0, right: 0, bottom: 0 }),
    theme: () => getDefaultTheme(),
    cursorDown: false,
    cursorX: 0,
    cursorY: 0,
    activeTab: null,
    layers: false,
    timeline: false,
    tabs: Tab.Collection.create(),
    fragments: PixieFragment.Collection.create(),
    undoManager: new UndoManager(),
    toolbox: ToolBox.create()
}) {
    /**
     * @returns {Tab}
     */
    getActiveTab ()
    {
        return this.tabs.find(this.activeTab)
    }

    /**
     * @returns {PixieFragment}
     */
    getActiveFragment ()
    {
        return this.fragments.find(this.getActiveTab().fragment)
    }

    /**
     * @param {string} title 
     * @returns {Application}
     */
    setTitle (title)
    {
        return this.set('title', title ? `${title} | ${APP_NAME}` : APP_NAME)
    }

    updateCursor ({ x, y, down })
    {
        if (!down) x = y = 0
        return this.merge({
            cursorX: x,
            cursorY: y,
            cursorDown: down
        })
    }

    openTab (fragment)
    {
        let tab = this.tabs.where({ fragment: fragment.pk }).first()
        let op = this
    
        if (!tab) {
            tab = Tab.create({ fragment: fragment.pk, zoom: fragment.getDefaultZoom() })
            op = op.delegateSet('tabs', 'add', tab)
        }

        return op.set('activeTab', tab.pk)
    }

    closeTab (tab)
    {
        let op = this.delegateSet('tabs', 'delete', tab)
        if (op.activeTab == this.tabs.getID(tab)) op = op.set('activeTab', this.tabs.first())
        return op
    }

    createNew (width, height)
    {
        const fragment = PixieFragment.create({ width, height })
        let op = this.delegateSet('fragments', 'add', fragment)
        op = op.openTab(fragment)
        op = op.delegateSet('undoManager', 'push', fragment, 'Created')
        return op
    }

    focus (focused = true)
    {
        return this.set('focused', focused)
    }

    blur ()
    {
        return this.focus(false)
    }

    toggleTheme ()
    {
        if (this.theme !== 'dark') return this.set('theme', 'dark')
        return this.set('theme', 'light')
    }
}
