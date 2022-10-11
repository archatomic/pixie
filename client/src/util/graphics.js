import { createNode } from 'client/util/createNode'

/** @type {HTMLCanvasElement} */
const canvas = createNode({ tag: 'canvas' })
    
/** @type {CanvasRenderingContext2D} */
const context = canvas.getContext('2d', { willReadFrequently: true })

const DEBUG_PATTERN = false

export const createImageData = (width, height) =>
{
    const op = new ImageData(width, height)

    if (DEBUG_PATTERN) {
        const randomDot = Math.floor(Math.random() * op.data.length / 4) * 4
        op.data[randomDot] = Math.random() * 256
        op.data[randomDot + 1] = Math.random() * 256
        op.data[randomDot + 2] = Math.random() * 256
        op.data[randomDot + 3] = 255
    }

    return op
}

export const imageDataToDataURI = (imagedata) =>
{
    canvas.width = imagedata.width
    canvas.height = imagedata.height
    context.putImageData(imagedata, 0, 0)
    return canvas.toDataURL()
}

export const loadImageContext = async (url) =>
{
    const response = await fetch(url)
    const blob = await response.blob()
    const image = await createImageBitmap(blob, {})

    const canvas = createNode({ tag: 'canvas' })
    const context = canvas.getContext('2d', { willReadFrequently: true })

    canvas.width = image.width
    canvas.height = image.height
    context.drawImage(image, 0, 0)

    return context
}