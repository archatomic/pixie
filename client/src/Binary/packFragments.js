import { List, Map } from 'immutable'
import { BinaryReader } from 'Pixie/Binary/BinaryReader'
import { BinaryWriter } from 'Pixie/Binary/BinaryWriter'
import { VISIBILITY } from 'Pixie/constants'
import { PixieCel } from 'Pixie/Model/PixieCel'
import { PixieFragment } from 'Pixie/Model/PixieFragment'
import { PixieFrame } from 'Pixie/Model/PixieFrame'
import { PixieLayer } from 'Pixie/Model/PixieLayer'
import { ensureArray } from 'Pixie/Util/array'
import { locate } from 'Pixie/Util/registry'

const TYPE = {
    fragment: 1,
    frame: 2,
    layer: 3,
    cel: 4,
}

export function unpack (data)
{
    const reader = new BinaryReader(data)

    const records = {
        fragments: [],
        frames: [],
        layers: [],
        cels: []
    }

    while (true)
    {
        try {
            unpackChunk(reader, records)
        } catch (e) {
            break
        }
    }

    return records
}

function unpackChunk (reader, records)
{
    const type = reader.readInt(8)
    switch (type) {
        case TYPE.fragment:
            return records.fragments.push(unpackFragment(reader))
        case TYPE.frame:
            return records.frames.push(unpackFrame(reader))
        case TYPE.layer:
            return records.layers.push(unpackLayer(reader))
        case TYPE.cel:
            return records.cels.push(unpackCel(reader))
    }
    return false
}

/**
 * @param {BinaryReader} reader
 */
function unpackFragment (reader)
{
    const pk = reader.readASCII(32)
    const name = reader.readASCII(32)
    const width = reader.readInt(16)
    const height = reader.readInt(16)

    const numFrames = reader.readInt(16)
    const frames = []
    for (let i = 0; i < numFrames; i++) {
        frames.push(reader.readASCII(32))
    }

    const numLayers = reader.readInt(16)
    const layers = []
    for (let i = 0; i < numLayers; i++) {
        layers.push(reader.readASCII(32))
    }

    const celKeyLen = reader.readInt(16)
    const cels = {}
    for (let i = 0; i < celKeyLen; i++) {
        const frame = reader.readASCII(32)
        const frameLayerLen = reader.readInt(16)
        cels[frame] = {}
        for (let j = 0; j < frameLayerLen; j++) {
            const layer = reader.readASCII(32)
            const cel = reader.readASCII(32)
            cels[frame][layer] = cel
        }
        cels[frame] = Map(cels[frame])
    }

    return PixieFragment.create({
        _id: pk,
        name,
        width,
        height,
        frames: List(frames),
        layers: List(layers),
        cels: Map(cels)
    })
}

/**
 * @param {BinaryReader} reader
 */
function unpackFrame (reader)
{
    const pk = reader.readASCII(32)
    const fragment = reader.readASCII(32)
    const duration = reader.readFloat(16)
    reader.readInt(16) // geometry length, ignored

    return PixieFrame.create({
        _id: pk,
        fragment,
        duration
    })
}

/**
 * @param {BinaryReader} reader
 */
function unpackLayer (reader)
{
    const pk = reader.readASCII(32)
    const fragment = reader.readASCII(32)
    const name = reader.readASCII(32)
    const visible = reader.readBool()
    return PixieLayer.create({
        _id: pk,
        fragment,
        name,
        visibility: visible? VISIBILITY.VISIBLE : VISIBILITY.HIDDEN
    })
}

/**
 * @param {BinaryReader} reader
 */
function unpackCel (reader)
{
    const pk = reader.readASCII(32)
    const fragment = reader.readASCII(32)
    const data = reader.readImage()

    return PixieCel.create({
        _id: pk,
        fragment,
        data
    })
}

export function packFragments (ids)
{
    const state = locate('state')
    const writer = new BinaryWriter()
    const data = {
        frames: [],
        layers: [],
        cels: [],
    }

    const fragments = state.fragments.findAll(ensureArray(ids)).toArray()
    console.log(fragments)
    for (const fragment of fragments) {
        packFragment(fragment, writer, data)
    }

    const frames = state.frames.findAll(data.frames).toArray()
    for (const frame of frames)
        packFrame(frame, writer)

    const layers = state.layers.findAll(data.layers).toArray()
    for (const layer of layers)
        packLayer(layer, writer)

    const cels = state.cels.findAll(data.cels).toArray()
    for (const cel of cels)
        packCel(cel, writer)

    return writer.data
}

/**
 * @param {import('Pixie/Model/PixieFragment').PixieFragment} fragment
 * @param {BinaryWriter} writer
 */
function packFragment (fragment, writer, ids)
{
    writer.writeInt(TYPE.fragment, 8)
    writer.writeASCII(fragment.pk, 32)
    writer.writeASCII(fragment.name, 32)
    writer.writeInt(fragment.width, 16)
    writer.writeInt(fragment.height, 16)

    // Write frames array
    writer.writeInt(fragment.frames.count(), 16)
    for (const frame of fragment.frames) {
        writer.writeASCII(frame, 32)
        if (ids.frames.indexOf(frame) > -1) continue
        ids.frames.push(frame)
    }

    // Write layers array
    writer.writeInt(fragment.layers.count(), 16)
    for (const layer of fragment.layers) {
        writer.writeASCII(layer, 32)
        if (ids.layers.indexOf(layer) > -1) continue
        ids.layers.push(layer)
    }

    // Write cels map
    // number of frames
    writer.writeInt(fragment.cels.count(), 16)
    for (const [frame, layers] of fragment.cels) {
        // write frame
        writer.writeASCII(frame, 32)
        // number of layers in frame
        writer.writeInt(layers.count(), 16)
        for (const [layer, cel] of layers) {
            writer.writeASCII(layer, 32)
            writer.writeASCII(cel, 32)
            if (ids.cels.indexOf(cel) > -1) continue
            ids.cels.push(cel)
        }
    }
}

/**
 * @param {import('Pixie/Model/PixieFrame').PixieFrame} frame
 * @param {BinaryWriter} writer
 */
function packFrame (frame, writer)
{
    writer.writeInt(TYPE.frame, 8)
    writer.writeASCII(frame.pk, 32)
    writer.writeASCII(frame.fragment, 32)
    writer.writeFloat(frame.duration, 16)
    writer.writeInt(0, 16) // geometry length
}

/**
 * @param {import('Pixie/Model/PixieLayer').PixieLayer} frame
 * @param {BinaryWriter} writer
 */
function packLayer (layer, writer)
{
    writer.writeInt(TYPE.layer, 8)
    writer.writeASCII(layer.pk, 32)
    writer.writeASCII(layer.fragment, 32)
    writer.writeASCII(layer.name, 32)
    writer.writeBool(layer.visible)
}

/**
 * @param {import('Pixie/Model/PixieCel').PixieCel} frame
 * @param {BinaryWriter} writer
 */
function packCel (cel, writer)
{
    writer.writeInt(TYPE.cel, 8)
    writer.writeASCII(cel.pk, 32)
    writer.writeASCII(cel.fragment, 32)
    writer.writeImage(cel.data)
}
