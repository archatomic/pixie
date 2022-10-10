import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_NUM_FRAMES, DEFAULT_FRAGMENT_NUM_LAYERS, DEFAULT_FRAGMENT_WIDTH } from 'client/constants'
import { applicationTabFocus, fragmentActions, frameActions, layerActions, tabActions } from 'client/store/actions/applicationActions'

import { PixieFragment } from 'client/model/PixieFragment'
import { Tab } from 'client/model/Tab'
import { locate } from 'client/util/registry'
import { PixieLayer } from 'client/model/PixieLayer'
import { PixieFrame } from 'client/model/PixieFrame'

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
        fragmentActions.save(fragment)

        this.addLayersToFragment(fragment.pk, numLayers)
        this.addFramesToFragment(fragment.pk, numFrames)

        this.openTab(fragment.pk)
        return fragment
    }

    static addLayerToFragment (fragmentID, at = -1)
    {
        const state = this.store.getState()
        let fragment = state.fragments.find(fragmentID)
        const layer = PixieLayer.create()
        layerActions.save(layer)
        fragment = fragment.delegateSet('layers', 'insert', layer.pk, at)
        fragmentActions.save(fragment)
    }

    static addLayersToFragment (fragmentID, num = 1, at = -1)
    {
        for (let i = 0; i < num; i++) {
            this.addLayerToFragment(fragmentID, at)
        }
    }

    static addFrameToFragment (fragmentID,at = -1)
    {
        const state = this.store.getState()
        let fragment = state.fragments.find(fragmentID)
        const frame = PixieFrame.create()
        frameActions.save(frame)
        fragment = fragment.delegateSet('frames', 'insert', frame.pk, at)
        fragmentActions.save(fragment)
    }

    static addFramesToFragment (fragmentID, num = 1, at = -1)
    {
        for (let i = 0; i < num; i++) {
            this.addFrameToFragment(fragmentID, at)
        }
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