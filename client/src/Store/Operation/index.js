import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_NUM_FRAMES, DEFAULT_FRAGMENT_NUM_LAYERS, DEFAULT_FRAGMENT_WIDTH, VISIBILITY } from 'Pixie/constants'
import { applicationTabFocus, celActions, fragmentActions, frameActions, layerActions, tabActions } from 'Pixie/Store/Action/applicationActions'

import { PixieFragment } from 'Pixie/Model/PixieFragment'
import { Tab } from 'Pixie/Model/Tab'
import { locate } from 'Pixie/Util/registry'
import { PixieLayer } from 'Pixie/Model/PixieLayer'
import { PixieFrame } from 'Pixie/Model/PixieFrame'
import { PixieCel } from 'Pixie/Model/PixieCel'
import { redo, undo, undoPush } from 'Pixie/Store/Action/undoActions'
import { replaceState } from 'Pixie/Store/Action/rootActions'
import { load } from 'Pixie/Util/load'
import { BinaryData } from 'Pixie/Binary/BinaryData'
import { playerActions } from 'Pixie/Store/Action/playerActions'
import { clamp } from 'Pixie/Util/math'
import { go } from 'Pixie/Util/navigate'

/**
 * @typedef {import('Pixie/Model/State').State} State
 */

export class Operation
{
    /** @type {State} */
    static get state ()
    {
        return locate('state')
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
        const state = this.state

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
        go(tab.route)

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
        this.pushHistory(fragment.pk, 'Created')
        return fragment
    }

    static deleteFragment (fragment)
    {
        fragmentActions.delete(fragment)
        frameActions.delete(this.state.frames.where({fragment}))
        layerActions.delete(this.state.layers.where({fragment}))
        celActions.delete(this.state.cels.where({fragment}))
        playerActions.delete(this.state.players.where({fragment}))
    }

    static getNextLayer (fragment)
    {
        const state = this.state
        const tab = state.tabs.where({ fragment }).first()
        return tab ? tab.layer + 1 : -1
    }

    static getNextFrame (fragment)
    {
        const state = this.state
        const tab = state.tabs.where({ fragment }).first()
        return tab ? tab.frame + 1 : -1
    }

    static addLayerToFragment (fragmentID, at = null)
    {
        const state = this.state

        if (at === null) at = this.getNextLayer(fragmentID)

        let fragment = state.fragments.find(fragmentID)
        const layer = PixieLayer.create({ fragment: fragmentID })
        layerActions.save(layer)
        fragment = fragment.delegateSet('layers', 'insert', at, layer.pk)
        fragmentActions.save(fragment)

        for (const frame of fragment.frames) {
            this.createCel(fragmentID, frame, layer.pk)
        }

        const tab = state.tabs.where({ fragment: fragment.pk }).first()
        if (tab) tabActions.save(tab.merge({ layer: at }))
    }

    static addLayersToFragment (fragmentID, num = 1, at = -1)
    {
        for (let i = 0; i < num; i++) {
            this.addLayerToFragment(fragmentID, at)
        }
    }

    static addFrameToFragment (fragmentID, at = null)
    {
        const state = this.state

        if (at === null) at = this.getNextFrame(fragmentID)

        let fragment = state.fragments.find(fragmentID)
        const frame = PixieFrame.create({ fragment: fragmentID })
        frameActions.save(frame)
        fragment = fragment.delegateSet('frames', 'insert', at, frame.pk)
        fragmentActions.save(fragment)

        for (const layer of fragment.layers) {
            this.createCel(fragmentID, frame.pk, layer)
        }

        const tab = state.tabs.where({ fragment: fragment.pk }).first()
        if (tab) tabActions.save(tab.merge({ frame: at }))
    }

    static addFramesToFragment (fragmentID, num = 1, at = -1)
    {
        for (let i = 0; i < num; i++) {
            this.addFrameToFragment(fragmentID, at)
        }
    }

    static closeTab (tabID)
    {
        const state = this.state
        const tab = state.tabs.find(tabID)
        if (tab.null) return // Tab not open

        // delete the tab
        tabActions.delete(tab)

        // Should I clean up the fragment and player?
        this.deleteFragment(tab.fragment)

        // Check if the application was focused on this tab, and if so, switch focus
        if (state.application.activeTab === tab.pk) {
            if (state.tabs.length <= 1)
                return applicationTabFocus(null)

            // Select new tab to focus on.
            // Retain current position, or select last tab if current
            // position isn't available anymore.
            const position = state.tabs.positionOf(tab.pk)
            const newTabs = this.state.tabs
            const newFocus = newTabs.positionToID(clamp(
                position,
                0,
                newTabs.length - 1
            ))
            applicationTabFocus(newFocus)
        }
    }

    static createCel (fragmentID, frameID, layerID)
    {
        const state = this.state
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
        const state = this.state
        const layer = state.layers.find(layerID)
        const tab = state.tabs.where({ fragment: layer.fragment }).first()
        if (!tab) return
        tabActions.save(tab.set('layer', layer.position()))
    }

    static activateFrame (frameID)
    {
        const state = this.state
        const frame = state.frames.find(frameID)
        const tab = state.tabs.where({ fragment: frame.fragment }).first()
        if (!tab) return
        tabActions.save(tab.set('frame', frame.position()))
    }

    static deleteLayer (layerID)
    {
        const state = this.state
        const layer = state.layers.find(layerID)

        let fragment = state.fragments.find(layer.fragment)
        let tab = state.tabs.where({ fragment: layer.fragment }).first()
        const maxIndex = fragment.layers.count() - 2

        if (maxIndex < 0) return // refuse to delete the last layer

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

    static deleteFrame (frameID)
    {
        const state = this.state
        const frame = state.frames.find(frameID)

        let fragment = state.fragments.find(frame.fragment)
        let tab = state.tabs.where({ fragment: frame.fragment }).first()
        const maxIndex = fragment.frames.count() - 2

        if (maxIndex < 0) return // refuse to delete the last frame

        // Reselect active layer
        if (tab?.frame >= maxIndex) tab = tab.set('frame', maxIndex)

        // Remove from fragment
        fragment = fragment.set('frames', fragment.frames.filter(v => v !== frameID))

        // Remove orphaned cels
        const cels = []
        for (const cel of fragment.getCels({ frame: frameID })) {
            fragment = fragment.deleteIn(['cels', cel.frame, cel.layer])
            cels.push(cel.cel)
        }

        // persist all
        if (tab) tabActions.save(tab)
        fragmentActions.save(fragment)
        celActions.delete(cels)
        frameActions.delete(frame)
    }

    static pushHistory (fragmentID, description)
    {
        undoPush(this.getHistoryNode(fragmentID), description)
    }

    static getHistoryNode (fragmentID)
    {
        const state = this.state
        const fragment = state.fragments.find(fragmentID)
        if (fragment.null) return

        return {
            undoKey: fragment.pk,
            fragment,
            frames: state.frames.where({ fragment: fragment.pk }).toArray(),
            layers: state.layers.where({ fragment: fragment.pk }).toArray(),
            cels: state.cels.where({ fragment: fragment.pk }).toArray(),
        }
    }

    static undoFragment (fragmentID, steps = 1)
    {
        undo({ undoKey: fragmentID }, steps)
        this.restoreHistory(fragmentID)
    }

    static redoFragment (fragmentID, steps = 1)
    {
        redo({ undoKey: fragmentID }, steps)
        this.restoreHistory(fragmentID)
    }

    static restoreHistory (fragmentID)
    {
        const state = this.state

        const remove = this.getHistoryNode(fragmentID)

        const without = state
            .delegateSet('fragments', 'remove', remove.fragment)
            .delegateSet('frames', 'removeAll', remove.frames)
            .delegateSet('layers', 'removeAll', remove.layers)
            .delegateSet('cels', 'removeAll', remove.cels)

        const add = state.history.getStack(fragmentID).current
        if (!add) return console.warn('cannot undo')

        let restored = without
            .delegateSet('fragments', 'add', add.fragment)
            .delegateSet('frames', 'addAll', add.frames)
            .delegateSet('layers', 'addAll', add.layers)
            .delegateSet('cels', 'addAll', add.cels)

        replaceState(restored)
        const tab = restored.tabs.where({ fragment: fragmentID }).first()
        tabActions.save(tab.clampFrameAndLayer())
    }

    static async load ()
    {
        const file = await load({
            extensions: ['.aseprite']
        })
        if (!file) return
        const parts = file.name.split('.')
        const extension = parts.pop()
        const name = parts.join('.')
        switch (extension) {
            case 'aseprite':
                return this.loadAseprite(name, file)
            case 'px':
                return this.loadPixie(name, file)
        }
    }

    static async loadAseprite (name, file)
    {
        const binaryData = await BinaryData.fromBlob(file)
        const aseprite = binaryData.unpack('Aseprite')

        let fragment = PixieFragment.create({
            width: aseprite.header.width,
            height: aseprite.header.height,
            name
        })

        const layers = []
        const frames = []
        const cels = []

        for (const aFrame of aseprite.frames) {
            const frame = PixieFrame.create({
                fragment: fragment.pk,
                duration: aFrame.frameDuration / 1000
            })

            frames.push(frame)
            fragment = fragment.delegateSet('frames', 'push', frame.pk)

            for (const chunk of aFrame.chunks) {
                switch (chunk.schema) {
                    case 'AsepriteLayer':
                        const layer = PixieLayer.create({
                            fragment: fragment.pk,
                            name: chunk.data.name,
                            visibility: chunk.data.visible
                                ? VISIBILITY.VISIBLE
                                : VISIBILITY.HIDDEN
                        })
                        layers.push(layer)
                        fragment = fragment.delegateSet('layers', 'push', layer.pk)
                        break
                    case 'AsepriteCel':
                        const celLayer = layers[chunk.data.layer].pk

                        const pixels = chunk.data.data.pixels
                        const offsetX = chunk.data.x
                        const offsetY = chunk.data.y
                        const width = chunk.data.data.width

                        const data = new ImageData(
                            fragment.width,
                            fragment.height
                        )

                        for (let i = 0; i < pixels.length; i++) {
                            const x = (i % width) + offsetX
                            const y = Math.floor(i / width) + offsetY
                            const i2 = (x + y * data.width) * 4
                            const pixel = pixels[i]

                            data.data[i2] = pixel.r
                            data.data[i2 + 1] = pixel.g
                            data.data[i2 + 2] = pixel.b
                            data.data[i2 + 3] = pixel.a
                        }

                        const cel = PixieCel.fromImageData(data).set(
                            'fragment',
                            fragment.pk
                        )

                        cels.push(cel)
                        fragment = fragment.setIn(['cels', frame.pk, celLayer], cel.pk)
                        break
                }
            }
        }

        this.saveAll(
            {
                fragments: [fragment],
                cels,
                layers,
                frames
            },
            'Loaded'
        )

        this.openTab(fragment.pk)
    }

    static saveAll (dict, description)
    {
        let state = this.state.load(dict)

        replaceState(state)

        for (const fragment of dict.fragments) {
            this.pushHistory(fragment.pk, description)
        }
    }

    static async loadPixie (name, file)
    {
        // TODO
        const binaryData = await BinaryData.fromBlob(file)
        const pixie = binaryData.unpack('Pixie')
    }
}
