/* eslint-env jest */
const { PixieFragment } = require('../PixieFragment')

describe('PixieFragment', () => {
    it ('can be created with a number of layers and frames', () => {
        const frag = PixieFragment.create({ numLayers: 10, numFrames: 3 })

        expect(frag.layers.length).toBe(10)
        expect(frag.frames.length).toBe(3)
    })

    it ('getLayer retrieves layers by id OR index', () => {
        const frag = PixieFragment.create({ numLayers: 10, numFrames: 3 })
        const layer = frag.getLayer(2)
        const idLayer = frag.getLayer(layer._id)

        expect(layer).toBe(idLayer)
    })

    it ('addLayer() inserts layers at the provided index', () => {
        let frag = PixieFragment.create({ numLayers: 10, numFrames: 3 })

        const layer = frag.getLayer(2)
        frag = frag.addLayer(2)

        expect(frag.getLayer(2)).not.toBe(layer)
        expect(frag.getLayer(3)).toBe(layer)
    })

    it ('deleting frames works', () => {
        let frag = PixieFragment.create({ numLayers: 10, numFrames: 3 })
            .fillCels()
            .deleteFrame(2)
        
        expect(frag.layers.length).toBe(10)
        expect(frag.frames.length).toBe(2)
        expect(frag.cels.count()).toBe(2)

        expect(() => { frag.deleteFrame('noExisty') }).not.toThrow()
    })

    it ('deleting layers works', () => {
        let frag = PixieFragment.create({ numLayers: 10, numFrames: 3 })
            .fillCels()
            .deleteLayer(2)
        
        expect(frag.frames.length).toBe(3)
        expect(frag.layers.length).toBe(9)
        expect(frag.cels.count()).toBe(3)

        frag.cels.forEach(v => {
            expect(v.count()).toBe(9)
        })

        expect(() => { frag.deleteLayer('noExisty') }).not.toThrow()
    })

    it ('getting Frame Cels works', () => {
        let frag = PixieFragment.create({ numLayers: 10, numFrames: 3 })
        expect(frag.getFrameCels(1).count()).toBe(10) // 1 for each layer
    })

    it ('getting Layer Cels works', () => {
        let frag = PixieFragment.create({ numLayers: 10, numFrames: 3 })
        expect(frag.getLayerCels(1).count()).toBe(3) // 1 for each layer
    })
})