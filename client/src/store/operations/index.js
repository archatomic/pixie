import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_NUM_FRAMES, DEFAULT_FRAGMENT_NUM_LAYERS, DEFAULT_FRAGMENT_WIDTH } from 'client/constants'
import { applicationTabFocus, fragmentActions, tabActions } from 'client/store/actions/applicationActions'

import { PixieFragment } from 'client/model/PixieFragment'
import { Tab } from 'client/model/Tab'
import { locate } from 'client/util/registry'

/**
 * @typedef {import('redux').Store<import('client/model/State').State>} Store
 */

export class Operation
{
    /** @type {Store} */
    static get store ()
    {
        return locate('store')
    }

    /**
     * Open a tab with the provided fragment
     *
     * If no fragment is provided, show the empty state tab
     *
     * @param {string} [fragment]
     *
     * @returns {Tab}
     */
    static openTab (fragmentID = null)
    {
        const state = this.store.getState()

        const fragment = state.fragments.find(fragmentID)
        const tab = fragment.null
            // No / invalid fragment provided. Create new empty tab
            ? Tab.create()
            : (
                // Lookup any existing tab for fragment
                state.tabs.where({ fragment: fragment.pk }).first()
                // No existing tab, create one
                || Tab.create({ fragment: fragment.pk, zoom: fragment.getDefaultZoom() })
            )

        // Store tab
        tabActions.save(tab)

        // Focus on tab
        applicationTabFocus(tab.pk)

        return tab
    }

    /**
     * @typedef {object} FragmentOptions
     * @property {number} [width]
     * @property {number} [height]
     * @property {number} [numLayers]
     * @property {number} [numFrames]
     */

    /**
     * Create a new PixieFragment, and open it in a tab.
     *
     * @param {FragmentOptions} [options]
     * @return {PixieFragment}
     */
    static createFragment ({
        width = DEFAULT_FRAGMENT_WIDTH,
        height = DEFAULT_FRAGMENT_HEIGHT,
        numLayers = DEFAULT_FRAGMENT_NUM_LAYERS,
        numFrames = DEFAULT_FRAGMENT_NUM_FRAMES,
    } = {})
    {
        const fragment = PixieFragment.create({ width, height, numLayers, numFrames })

        // Todo, move frames and layers outside of the fragment constructor

        fragmentActions.save(fragment)
        this.openTab(fragment.pk)
        return fragment
    }

    static closeTab (tabID)
    {
        const state = this.store.getState()
        const tab = state.tabs.find(tabID)
        if (tab.null) return // Tab not open

        // delete the tab
        tabActions.delete(tab)

        // Should I clean up the fragment?

        // Check if the application was focused on this tab, and if so, switch focus
        if (state.tabs.find(state.application.activeTab) === tab.pk) {
            applicationTabFocus(
                state.tabs.length
                    ? state.tabs.first().pk
                    : null
            )
        }
    }
}