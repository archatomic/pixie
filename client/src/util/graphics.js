import { createNode } from 'client/util/createNode'

/** @type {CanvasRenderingContext2D} */
const context = createNode({ tag: 'canvas' }).getContext('2d')

const DEBUG_PATTERN = true

export const createImageData = (width, height) =>
{
    const op = context.createImageData(width, height)

    if (DEBUG_PATTERN) {
        const randomDot = Math.floor(Math.random() * op.data.length / 4) * 4
        op.data[randomDot] = Math.random() * 256
        op.data[randomDot + 1] = Math.random() * 256
        op.data[randomDot + 2] = Math.random() * 256
        op.data[randomDot + 3] = 255
    }

    return op
}