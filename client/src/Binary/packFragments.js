import { BinaryData } from 'Pixie/Binary/BinaryData'
import { ensureArray } from 'Pixie/Util/array'
import { isDefined } from 'Pixie/Util/default'
import { locate } from 'Pixie/Util/registry'
import { invariant } from 'Pixie/Util/invariant'
import { VISIBILITY } from 'Pixie/constants'
import { PixieFragment } from 'Pixie/Model/PixieFragment'
import { PixieLayer } from 'Pixie/Model/PixieLayer'
import { PixieFrame } from 'Pixie/Model/PixieFrame'
import { PixieCel } from 'Pixie/Model/PixieCel'
import { List, Map } from 'immutable'

export async function unpackFragments (file)
{
    const data = await BinaryData.fromBlob(file)
    const {
        fragments,
        layers,
        frames,
        cels
    } = data.unpack('Pixie')

    const ids = {}

    for (const fragment of fragments) {
        fragment.record = PixieFragment.create({
            name: fragment.name,
            width: fragment.with,
            height: fragment.height
        })
        ids[fragment.id] = fragment.record.pk
    }

    for (const layer of layers) {
        layer.record = PixieLayer.create({
            fragment: ids[layer.fragment],
            name: layer.name,
            visibility: layer.visible ? VISIBILITY.VISIBLE : VISIBILITY.HIDDEN
        })
        ids[layer.id] = layer.record.pk
    }

    for (const frame of frames) {
        frame.record = PixieFrame.create({
            fragment: ids[frame.fragment],
            duration: frame.duration,
            geometry: frame.geometry || null
        })
        ids[frame.id] = frame.record.pk
    }

    for (const cel of cels) {
        cel.record = PixieCel.create({
            fragment: ids[cel.fragment],
            width: cel.width,
            height: cel.height,
            x: cel.x,
            y: cel.y,
            data: cel.data
        })
        ids[cel.id] = cel.record.pk
    }

    for (const fragment of fragments) {
        let celMap = Map()
        for (const [frame, layer, cel] of fragment.cels) {
            const fID = ids[frame]
            const lID = ids[layer]
            const cID = ids[cel]
            celMap = celMap.setIn([fID, lID], cID)
        }
        fragment.record = fragment.record.merge({
            frames: List(fragment.frames.map(id => ids[id])),
            layers: List(fragment.layers.map(id => ids[id])),
            cels: celMap
        })
    }

    return {
        fragments: fragments.map(r => r.record),
        frames: frames.map(r => r.record),
        layers: layers.map(r => r.record),
        cels: cels.map(r => r.record),
    }
}

export function packFragments (ids)
{
    const state = locate('state')

    let maxID = 0
    const chunkIDs = {}
    let layerPKs = []
    let framePKs = []
    const celPKs = []

    const fragments = state.fragments.findAll(ensureArray(ids)).toData()
    for (const fragment of fragments) {
        fragment.id = maxID++
        chunkIDs[fragment._id] = fragment.id
        layerPKs = layerPKs.concat(fragment.layers)
        framePKs = framePKs.concat(fragment.frames)
        fragment._cels = []
        for (const [frame, layerCel] of Object.entries(fragment.cels)) {
            for (const [layer, cel] of Object.entries(layerCel)) {
                celPKs.push(cel)
                fragment._cels.push([frame, layer, cel])
            }
        }
    }

    const frames = state.frames.findAll(framePKs).toData()
    for (const frame of frames) {
        frame.id = maxID++
        chunkIDs[frame._id] = frame.id
        frame.fragment = chunkIDs[frame.fragment]
        invariant(isDefined(frame.fragment), 'Tried to pack a frame without its fragment')
    }

    const layers = state.layers.findAll(layerPKs).toData()
    for (const layer of layers) {
        layer.id = maxID++
        chunkIDs[layer._id] = layer.id
        layer.fragment = chunkIDs[layer.fragment]
        layer.visible = layer.visibility !== VISIBILITY.HIDDEN
        invariant(isDefined(layer.fragment), 'Tried to pack a layer without its fragment')
    }

    const cels = state.cels.findAll(celPKs).toData()
    for (const cel of cels) {
        cel.id = maxID++
        chunkIDs[cel._id] = cel.id
        cel.fragment = chunkIDs[cel.fragment]
        invariant(isDefined(cel.fragment), 'Tried to pack a cel without its fragment')
    }

    for (const fragment of fragments) {
        fragment.frames = fragment.frames.map(id => chunkIDs[id])
        fragment.layers = fragment.layers.map(id => chunkIDs[id])
        fragment.cels = fragment._cels.map(([a, b, c]) => [
            chunkIDs[a],
            chunkIDs[b],
            chunkIDs[c],
        ])
    }

    const data = BinaryData.create()

    data.pack('Pixie', {
        fragments,
        layers,
        frames,
        cels
    })

    return data
}
