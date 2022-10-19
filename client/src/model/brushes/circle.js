import { SparseImage } from 'Pixie/model/SparseImage'
import { loadImageContext } from 'Pixie/util/graphics'
import { int } from 'Pixie/util/math'
import circles from './circles.png'

const CACHE = {};

(async function ()
{
    const ctx = await loadImageContext(circles)

    let x = 0
    for (let i = 0; i < 20; i++) {
        const size = i + 1
        const offset = - int(size / 2)

        const data = ctx.getImageData(x, 0, size, size)
        CACHE[size] = SparseImage.fromImageData(data, offset, offset)

        x += size
    }
})()

export const getCircleBrush = size =>
{
    return CACHE[size] || CACHE[1]
}