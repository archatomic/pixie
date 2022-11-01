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
                data.unpack('AsepriteFrames', value, aseprite)
            },
            unpack (data, aseprite)
            {
                return data.unpack('AsepriteFrames', aseprite)
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
        .property('flags', SCHEMA.INT, DWORD)
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
        //[0x0004, 'AsepritePalette'],
        //[0x0011, 'AsepritePalette'],
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
        .property('bytes', SCHEMA.INT, DWORD)
        .property('type', SCHEMA.INT, WORD)
        .property('data', {
            pack (data, value, chunk, aseprite)
            {
                const schema = CHUNK_SCHEMA.get(chunk.type)
                data.pack(schema, value, aseprite)
            },
            unpack (data, chunk)
            {
                const schema = CHUNK_SCHEMA.get(chunk.type)
                return data.unpack(schema, aseprite)
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
        .property('lockMovement', SCHEMA.BOOL)
        .property('background', SCHEMA.BOOL)
        .property('preferLinkedCels', SCHEMA.BOOL)
        .property('collapsed', SCHEMA.BOOL)
        .property('reference', SCHEMA.BOOL)
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
            pack (data, d, cel)
            {
                switch (cel.type) {
                    case 0: // raw data
                        break
                    case 1: // linked cel
                        data.writeInt(d, WORD)
                        break
                    case 2: // compressed image
                        break
                    case 3: // compressed tilemap
                }
                if (cel.type === 0) data.ignore()
            }
        })
        .build()
}
