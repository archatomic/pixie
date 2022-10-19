import { DEFAULT_FRAME_DURATION } from 'Pixie/constants'
import { Record } from './Record'

export class PixieFrame extends Record({
    fragment: null,
    duration: DEFAULT_FRAME_DURATION,
    geometry: null
}) {
    get fps ()
    {
        return 1 / this.duration
    }

    setFps (fps)
    {
        return this.set('duration', 1 / fps)
    }

    active ()
    {
        const active = this.state.tabs.where({ fragment: this.fragment }).first()?.frame
        if (active === this.pk) return true // explicit active layer
        return this.position() === active
    }

    position ()
    {
        const fragment = this.state.fragments.find(this.fragment)
        return fragment.frames.indexOf(this.pk)
    }
}
