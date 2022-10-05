import { DEFAULT_FRAME_DURATION } from 'client/constants'
import { Record } from './Record'

export class PixieFrame extends Record({
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
}
