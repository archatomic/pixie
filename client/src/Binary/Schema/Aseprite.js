import { SCHEMA } from 'Pixie/Binary/Schema/defs'
import { SchemaBuilder } from 'Pixie/Binary/Schema/SchemaBuilder'

/**
 * @see https://github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md
 */

const BYTE = 8
const WORD = 16
const DWORD = 32
const SHORT = 16 // Implies signed
const LONG = 32 // Implies signed
const FIXED = 32  // Float

export const addAsepriteSupport = () =>
{
    SchemaBuilder
        .object('Aseprite')
        .property('header', 'AsepriteHeader')
        .property('frames', {
            pack (data, value, aseprite)
            {
                for (const frame of value) {
                    data.pack('AsepriteFrames', frame, aseprite)
                }
            },
            unpack (data, aseprite)
            {
                const op = []
                for (let i = 0; i < aseprite.header.frames; i++) {
                    op.push(data.unpack('AsepriteFrames', aseprite))
                }
                return op
            }
        })
        .build()

    SchemaBuilder
        .object('AsepriteHeader')
        .property('fileSize', SCHEMA.INT, DWORD)
        .property('magicNumber', SCHEMA.INT, WORD)
        .property('frames', SCHEMA.INT, WORD)
        .property('width', SCHEMA.INT, WORD)
        .property('height', SCHEMA.INT, WORD)
        .property('colorDepth', SCHEMA.INT, WORD)
        .property('layerOpacityValid', SCHEMA.BOOL)
        .ignore(DWORD - 1)
        .property('speed', SCHEMA.INT, WORD)
        .ignore(DWORD)
        .ignore(DWORD)
        .property('indexedTransparent', SCHEMA.INT, BYTE)
        .ignore(BYTE * 3)
        .property('numColors', SCHEMA.INT, WORD)
        .property('pixelWidth', SCHEMA.INT, BYTE)
        .property('pixelHeight', SCHEMA.INT, BYTE)
        .property('gridX', SCHEMA.INT, SHORT) // note: this is signed
        .property('gridY', SCHEMA.INT, SHORT) // note: this is signed
        .property('gridWidth', SCHEMA.INT, WORD)
        .property('gridHeight', SCHEMA.INT, WORD)
        .ignore(BYTE * 84)
        .build()

    SchemaBuilder
        .object('AsepriteFrames')
        .property('bytes', SCHEMA.INT, DWORD)
        .property('magicNumber', SCHEMA.INT, WORD)
        .property('chunkCountSmall', SCHEMA.INT, WORD)
        .property('frameDuration', SCHEMA.INT, WORD)
        .ignore(BYTE * 2)
        .property('chunkCountLarge', SCHEMA.INT, DWORD)
        .property('chunks', {
            pack (data, value, _, aseprite)
            {
                for (const chunk of value) {
                    data.pack('AsepriteChunk', chunk, aseprite)
                }
            },
            unpack (data, frames, aseprite)
            {
                const numChunks = frames.chunkCountLarge || frames.chunkCountSmall
                const op = []
                for (let i = 0; i < numChunks; i++) {
                    op.push(data.unpack('AsepriteChunk', aseprite))
                }
                return op
            }
        })
        .build()

    const CHUNK_SCHEMA = new Map([
        [0x0004, 'LegacyAsepritePalette'],
        [0x0011, 'LegacyAsepritePalette2'],
        [0x2004, 'AsepriteLayer'],
        [0x2005, 'AsepriteCel'],
        [0x2006, 'AsepriteCelExtra'],
        [0x2007, 'AsepriteColorProfile'],
        [0x2008, 'AsepriteExternalFiles'],
        [0x2016, 'AsepriteMask'],
        [0x2017, 'AsepritePath'],
        [0x2018, 'AsepriteTags'],
        [0x2019, 'AsepritePalette'],
        [0x2020, 'AsepriteUserData'],
        [0x2022, 'AsepriteSlice'],
        [0x2022, 'AsepriteTileset'],
    ])

    SchemaBuilder
        .object('AsepriteChunk')
        .property('size', SCHEMA.INT, DWORD)
        .property('type', SCHEMA.INT, WORD)
        .property('data', {
            pack (data, value, chunk, aseprite)
            {
                const size = chunk.size * BYTE - DWORD - WORD
                const schema = CHUNK_SCHEMA.get(chunk.type)
                if (!data.canPack(schema)) return data.writeIgnore(0, size)
                data.pack(schema, value, size, chunk, aseprite)
            },
            unpack (data, chunk, aseprite)
            {
                const size = chunk.size * BYTE - DWORD - WORD
                const schema = CHUNK_SCHEMA.get(chunk.type)
                chunk.schema = schema
                if (!data.canPack(schema)) return data.readIgnore(size)
                return data.unpack(schema, size, chunk, aseprite)
            }
        })
        .build()

    SchemaBuilder
        .primative('AsepriteString')
        .pack((data, value) =>
        {
            data.writeInt(value.length, WORD)
            data.writeString(value, value.length, 8)
        })
        .unpack((data) =>
        {
            const length = data.readInt(WORD)
            return data.readString(length, 8)
        })
        .build()

    SchemaBuilder
        .object('AsepriteLayer')
        .property('visible', SCHEMA.BOOL)
        .property('editable', SCHEMA.BOOL)
        .property('movementLocked', SCHEMA.BOOL)
        .property('background', SCHEMA.BOOL)
        .property('preferLinkedCels', SCHEMA.BOOL)
        .property('collapsed', SCHEMA.BOOL)
        .property('reference', SCHEMA.BOOL)
        .ignore(WORD - 7)
        .property('type', SCHEMA.INT, WORD)
        .property('childLevel', SCHEMA.INT, WORD)
        .property('defaultWidth', SCHEMA.INT, WORD)
        .property('defaultHeight', SCHEMA.INT, WORD)
        .property('blendMode', SCHEMA.INT, WORD)
        .property('opacity', SCHEMA.INT, BYTE)
        .ignore(BYTE * 3)
        .property('name', 'AsepriteString')
        .property('tileset', {
            pack (data, tileset, layer)
            {
                if (layer.type === 2) data.writeInt(tileset, DWORD)
            },
            unpack (data, layer)
            {
                if (layer.type === 2) return data.readInt(DWORD)
            }
        })
       .build()

    SchemaBuilder
        .object('AsepriteCel')
        .property('layer', SCHEMA.INT, WORD)
        .property('x', SCHEMA.INT, SHORT)
        .property('y', SCHEMA.INT, SHORT)
        .property('opacity', SCHEMA.INT, BYTE)
        .property('type', SCHEMA.INT, WORD)
        .ignore(BYTE * 7)
        .property('data', {
            pack (data, d, cel, celSize, chunk, aseprite)
            {
                const size = celSize - WORD * 2 - SHORT * 2 - BYTE * 8
                switch (cel.type) {
                    case 0: // raw data
                        data.writeImage(d)
                        break
                    case 1: // linked cel
                        data.writeInt(d, WORD)
                        break
                    case 2: // compressed image
                        console.log(size, size / 8)
                        break
                    case 3: // compressed tilemap
                        break
                }
                data.writeIgnore(0, size)
            },
            unpack (data, cel, celSize, chunk, aseprite)
            {
                let size = celSize - WORD * 2 - SHORT * 2 - BYTE * 8
                let width, height, pixels
                switch (cel.type) {
                    case 0: // raw data
                        width = data.readInt(WORD)
                        height = data.readInt(WORD)
                        pixels = []
                        for (let i = 0; i < width * height; i++) {
                            pixels.push(data.unpack('AsepritePixel', aseprite.header.colorDepth))
                        }
                        return { width, height, pixels}
                    case 1: // linked cel
                        return data.readInt(WORD)
                    case 2: // compressed image
                        width = data.readInt(WORD)
                        height = data.readInt(WORD)
                        pixels = []

                        size -= WORD * 2
                        const b = data.unzip(size / BYTE)
                        for (let i = 0; i < width * height; i++) {
                            pixels.push(b.unpack('AsepritePixel', aseprite.header.colorDepth))
                        }

                        return { width, height, pixels }
                    case 3: // compressed tilemap
                        width = data.readInt(WORD)
                        height = data.readInt(WORD)
                        const bitsPerTile = data.readInt(WORD)
                        const bitMaskTileID = data.readInt(DWORD)
                        const bitMaskXFlip = data.readInt(DWORD)
                        const bitMaskYFilp = data.readInt(DWORD)
                        const bitMaskCWRot = data.readInt(DWORD)
                        data.ignore(BYTE * 10)
                        size -= BYTE * 10 + DWORD * 4 + WORD * 3

                        const t = data.unzip(size / BYTE)
                        const tiles = []
                        for (let i = 0; i < width * height; i++) {
                            tiles.push(t.readInt(bitsBerTile))
                        }

                        return {
                            width,
                            height,
                            bitsPerTile,
                            bitMaskTileID,
                            bitMaskXFlip,
                            bitMaskYFilp,
                            bitMaskCWRot,
                            tiles
                        }
                }
                data.readIgnore(size)
            }
        })
        .build()

    SchemaBuilder
        .object('AsepriteCelExtra')
        .property('flags', SCHEMA.INT, DWORD)
        .property('x', SCHEMA.INT, FIXED)
        .property('y', SCHEMA.INT, FIXED)
        .property('width', SCHEMA.INT, FIXED)
        .property('height', SCHEMA.INT, FIXED)
        .ignore(BYTE * 16)
        .build()

    SchemaBuilder
        .object('AsepriteColorProfile')
        .property('type', SCHEMA.INT, WORD)
        .property('flags', SCHEMA.INT, WORD)
        .property('gamma', SCHEMA.INT, FIXED)
        .ignore(BYTE * 8)
        .property('iccProfile', {
            pack (data, value, colorProfile)
            {
                if (colorProfile.type !== 2) return
                data.writeArray(value, SCHEMA.INT, BYTE)
            },
            unpack (data, colorProfile)
            {
                if (colorProfile.type !== 2) return
                return data.readArray(SCHEMA.INT, BYTE)
            }
        })
        .build()

    SchemaBuilder
        .object('AsepriteExternalFiles')
        .property('count', SCHEMA.INT, DWORD)
        .ignore(BYTE * 8)
        .property('files', {
            pack (data, value, files)
            {
                files.count = value.length
                for (const file of value) {
                    data.writeInt(file.id, DWORD)
                    data.writeIgnore(0, BYTE * 8)
                    data.pack('AsepriteString', value.name)
                }
            },
            unpack (data, files)
            {
                const op = []
                for (let i = 0; i < files.length; i++) {
                    const file = {}
                    file.id = data.readInt(SCHEMA.INT, DWORD)
                    data.readIgnore(BYTE * 8)
                    file.name = data.unpack('AsepriteString')
                    op.push(file)
                }
                return op
            }
        })
        .build()

    SchemaBuilder
        .object('AsepriteTags')
        .property('count', SCHEMA.INT, WORD)
        .ignore(BYTE * 8)
        .property('tags', {
            pack (data, value, tags)
            {
                tags.count = value.length
                for (const tag of value) {
                    data.writeInt(tag.from, WORD)
                    data.writeInt(tag.to, WORD)
                    data.writeInt(tag.direction, BYTE)
                    data.writeInt(tag.repeat, WORD)
                    data.writeIgnore(0, BYTE * 6)
                    data.writeInt(tag.r, BYTE)
                    data.writeInt(tag.g, BYTE)
                    data.writeInt(tag.b, BYTE)
                    data.writeIgnore(BYTE)
                    data.pack('AsepriteString', tag.name)
                }
            },
            unpack (data, tags)
            {
                const op = []
                for (let i = 0; i < tags.count; i++) {
                    const tag = {}
                    tag.from = data.readInt(WORD)
                    tag.to = data.readInt(WORD)
                    tag.direction = data.readInt(BYTE)
                    tag.repeat = data.readInt(WORD)
                    data.readIgnore(BYTE * 6)
                    tag.r = data.readInt(BYTE)
                    tag.g = data.readInt(BYTE)
                    tag.b = data.readInt(BYTE)
                    data.readIgnore(BYTE)
                    tag.name = data.unpack('AsepriteString')
                    op.push(tag)
                }
                return op
            }
        })
        .build()

    SchemaBuilder
        .primative('AsepritePixel')
        .argument('bits', 32)
        .pack((data, value, bits) =>
        {
            switch (bits) {
                case 32:
                    data.writeInt(value.r, BYTE)
                    data.writeInt(value.g, BYTE)
                    data.writeInt(value.b, BYTE)
                    data.writeInt(value.a, BYTE)
                    return
                case 16:
                    data.writeInt(value.r, BYTE)
                    data.writeInt(value.a, BYTE)
                    return
                case 8:
                    data.writeInt(value.a, BYTE)
                    return
            }
            throw new Error('Aseprite only supports 32, 16, and 8 bit colors')
        })
        .unpack((data, bits) =>
        {
            const op = {}

            switch (bits) {
                case 32:
                    op.r = data.readInt(BYTE)
                    op.g = data.readInt(BYTE)
                    op.b = data.readInt(BYTE)
                    op.a = data.readInt(BYTE)
                    return op
                case 16:
                    op.r = data.readInt(BYTE)
                    op.g = op.r
                    op.b = op.r
                    op.a = data.readInt(BYTE)
                    return op
                case 8:
                    op.r = data.readInt(BYTE)
                    op.g = op.r
                    op.b = op.r
                    op.a = op.r
                    return op
            }

            throw new Error('Aseprite only supports 32, 16, and 8 bit colors')
        })
        .build()

    SchemaBuilder
        .object('AsepritePalette')
        .property('newSize', SCHEMA.INT, DWORD)
        .property('from', SCHEMA.INT, DWORD)
        .property('to', SCHEMA.INT, DWORD)
        .ignore(BYTE * 8)
        .property('colors', {
            pack (data, colors, palette)
            {
                const count = palette.to - palette.from + 1
                for (let i = 0; i < count; i++) {
                    const color = colors[i]
                    data.writeInt(color.name ? 1 : 0, WORD)
                    data.writeInt(color.r, BYTE)
                    data.writeInt(color.g, BYTE)
                    data.writeInt(color.b, BYTE)
                    data.writeInt(color.a, BYTE)
                    if (color.name) data.pack('AsepriteString', color.name)
                }
            },
            unpack (data, palette)
            {
                const count = palette.to - palette.from + 1
                const colors = []
                for (let i = 0; i < count; i++) {
                    const color = {}
                    color.flags = data.readInt(WORD)
                    color.r = data.readInt(BYTE)
                    color.g = data.readInt(BYTE)
                    color.b = data.readInt(BYTE)
                    color.a = data.readInt(BYTE)
                    color.name = color.flags & 1
                        ? data.unpack('AsepriteString')
                        : ''
                    colors.push(color)
                }
                return colors
            }
        })
        .build()
}
