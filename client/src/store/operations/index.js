import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_NUM_FRAMES, DEFAULT_FRAGMENT_NUM_LAYERS, DEFAULT_FRAGMENT_WIDTH } from 'client/constants'
import { applicationTabFocus, celActions, fragmentActions, frameActions, layerActions, tabActions } from 'client/store/actions/applicationActions'

import { PixieFragment } from 'client/model/PixieFragment'
import { Tab } from 'client/model/Tab'
import { locate } from 'client/util/registry'
import { PixieLayer } from 'client/model/PixieLayer'
import { PixieFrame } from 'client/model/PixieFrame'
import { PixieCel } from 'client/model/PixieCel'

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

    static getNextLayer (fragment)
    {
        const tab = state.tabs.where({ fragment }).first()
        return tab ? tab.layer + 1 : -1
    }

    static addLayerToFragment (fragmentID, at = null)
    {
        const state = this.store.getState()

        if (at === null) at = this.getNextLayer(fragmentID)

        let fragment = state.fragments.find(fragmentID)
        const layer = PixieLayer.create({ fragment: fragmentID })
        layerActions.save(layer)
        fragment = fragment.delegateSet('layers', 'insert', at, layer.pk)
        fragmentActions.save(fragment)

        for (const frame of fragment.frames) {
            this.createCel(fragmentID, frame, layer.pk)
        }
    }

    static addLayersToFragment (fragmentID, num = 1, at = -1)
    {
        for (let i = 0; i < num; i++) {
            this.addLayerToFragment(fragmentID, at)
        }
    }

    static addFrameToFragment (fragmentID, at = -1)
    {
        const state = this.store.getState()
        let fragment = state.fragments.find(fragmentID)
        const frame = PixieFrame.create({ fragment: fragmentID })
        frameActions.save(frame)
        fragment = fragment.delegateSet('frames', 'insert', at, frame.pk)
        fragmentActions.save(fragment)

        for (const layer of fragment.layers) {
            this.createCel(fragmentID, frame.pk, layer)
        }
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

    static createCel (fragmentID, frameID, layerID)
    {
        const state = this.store.getState()
        const fragment = state.fragments.find(fragmentID)
        const cel = PixieCel.create({
            fragment: fragmentID,
            width: fragment.width,
            height: fragment.height
        })
        celActions.save(cel)
        fragmentActions.save(
            fragment.setIn(['cels', frameID, layerID], cel.pk)
        )
    }

    static activateLayer (layerID)
    {
        const state = this.store.getState()
        const layer = state.layers.find(layerID)
        const tab = state.tabs.where({ fragment: layer.fragment }).first()
        if (!tab) return
        tabActions.save(tab.set('layer', layer.position()))
    }

    static deleteLayer (layerID)
    {
        const state = this.store.getState()
        const layer = state.layers.find(layerID)
    
        let fragment = state.fragments.find(layer.fragment)
        let tab = state.tabs.where({ fragment: layer.fragment }).first()
        const maxIndex = fragment.layers.count() - 2

        // Reselect active layer
        if (tab?.layer >= maxIndex) tab = tab.set('layer', maxIndex)

        // Remove from fragment
        fragment = fragment.set('layers', fragment.layers.filter(v => v !== layerID))

        // Remove orphaned cels
        const cels = []
        for (const cel of fragment.getCels({ layer: layerID })) {
            fragment = fragment.deleteIn(['cels', cel.frame, cel.layer])
            cels.push(cel.cel)
        }

        // persist all
        if (tab) tabActions.save(tab)
        fragmentActions.save(fragment)
        celActions.delete(cels)
        layerActions.delete(layer)
    }
}