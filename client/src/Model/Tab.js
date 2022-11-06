import { mod } from 'Pixie/Util/math'
import { Record } from './Record'

export class Tab extends Record({
    fragment: null,
    frame: 0,
    layer: 0,
    zoom: 1,
    rotate: 0,
    x: 0,
    y: 0,
    play: false,
    onionSkin: 0
}) {
    get name ()
    {
        return this.state.fragments.find(this.fragment).name || 'Untitled'
    }

    get active ()
    {
        return this.state.application.activeTab === this.pk
    }

    clampFrameAndLayer ()
    {
        const fragment = this.state.fragments.find(this.fragment)
        let op = this

        const maxLayer = fragment.layers.count() - 1
        const maxFrame = fragment.frames.count() - 1

        if (this.layer > maxLayer) op = op.set('layer', maxLayer)
        if (this.frame > maxFrame) op = op.set('frame', maxFrame)

        return op
    }

    nextFrame ()
    {
        return this.setFrame(this.frame + 1)
    }

    prevFrame ()
    {
        return this.setFrame(this.frame - 1)
    }

    setFrame (i)
    {
        const fragment = this.state.fragments.find(this.fragment)
        return this.set('frame', mod(i, fragment.frames.count()))
    }

    setLayer (i)
    {
        const fragment = this.state.fragments.find(this.fragment)
        return this.set('layer', mod(i, fragment.layers.count()))
    }

    setOnionSkin (size)
    {
        return this.set('onionSkin', Math.max(size || 0, 0))
    }
}
