import { APP_NAME } from 'client/constants'
import { PixieFragment } from './PixieFragment'
import { Record } from './Record'
import { Tab } from './Tab'
import { ToolBox } from 'client/model/ToolBox'
import { getDefaultTheme } from 'client/util/theme'
import { locate } from 'client/util/registry'

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
    toolbox: ToolBox.create()
}) {
    /**
     * @returns {Tab}
     */
    getActiveTab ()
    {
        // remove me?
        return this.state.tabs.find(this.activeTab)
    }

    /**
     * @returns {PixieFragment}
     */
    getActiveFragment ()
    {
        // remove me, this should go on the tab
        return this.state.fragments.find(this.getActiveTab().fragment)
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
