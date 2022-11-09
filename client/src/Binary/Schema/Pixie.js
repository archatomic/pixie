import { SCHEMA } from 'Pixie/Binary/Schema/defs'
import { SchemaBuilder } from 'Pixie/Binary/Schema/SchemaBuilder'

const DYNAMIC_LENGTH = 0
const ASCII = 7
const BYTE = 8
const WORD = 16
const DWORD = 32

export const addPixieSupport = () =>
{
    SchemaBuilder
        .primative('Pixie')
        .pack((data, { fragments, frames, layers, cels }) =>
        {
            const numChunks = fragments.length + frames.length + layers.length + cels.length
            data.writeInt(numChunks, WORD)

            for (const fragment of fragments) {
                data.writeChunk(fragment, 'PixieFragment')
            }

            for (const frame of frames) {
                data.writeChunk(frame, 'PixieFrame')
            }

            for (const layer of layers) {
                data.writeChunk(layer, 'PixieLayer')
            }

            for (const cel of cels) {
                data.writeChunk(cel, 'PixieCel')
            }
        })
        .unpack((data) =>
        {
            const numChunks = data.readInt(WORD)

            const op = {
                fragments: [],
                frames: [],
                layers: [],
                cels: [],
            }

            for (let i = 0; i < numChunks; i++) {
                const chunk = data.readChunk()
                const key = [
                    'fragments',
                    'frames',
                    'layers',
                    'cels'
                ][chunk.type]
                op[key].push(chunk)
            }

            return op
        })
        .build()

    SchemaBuilder
        .object('PixieFragment')
        .property('type', SCHEMA.STATIC, 0)
        .property('id', SCHEMA.INT, WORD)
        .property('width', SCHEMA.INT, WORD)
        .property('height', SCHEMA.INT, WORD)
        .property('name', SCHEMA.STRING, DYNAMIC_LENGTH, ASCII)
        .property('layers', SCHEMA.ARRAY, SCHEMA.INT, WORD)
        .property('frames', SCHEMA.ARRAY, SCHEMA.INT, WORD)
        .property('cels', SCHEMA.ARRAY, SCHEMA.ARRAY, SCHEMA.INT, WORD)
        .build()

    SchemaBuilder
        .object('PixieFrame')
        .property('type', SCHEMA.STATIC, 1)
        .property('id', SCHEMA.INT, WORD)
        .property('fragment', SCHEMA.INT, WORD)
        .property('duration', SCHEMA.FLOAT)
        .build()

    SchemaBuilder
        .object('PixieLayer')
        .property('type', SCHEMA.STATIC, 2)
        .property('id', SCHEMA.INT, WORD)
        .property('fragment', SCHEMA.INT, WORD)
        .property('name', SCHEMA.STRING, DYNAMIC_LENGTH, ASCII)
        .property('visible', SCHEMA.BOOL)
        .build()

    SchemaBuilder
        .object('PixieCel')
        .property('type', SCHEMA.STATIC, 3)
        .property('id', SCHEMA.INT, WORD)
        .property('fragment', SCHEMA.INT, WORD)
        .property('width', SCHEMA.INT, WORD)
        .property('height', SCHEMA.INT, WORD)
        .property('x', SCHEMA.INT, DWORD)
        .property('y', SCHEMA.INT, DWORD)
        .property('data', SCHEMA.ZIP, SCHEMA.IMAGE)
        .build()

}
