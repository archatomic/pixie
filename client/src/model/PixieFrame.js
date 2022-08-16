import { DEFAULT_FRAME_DURATION } from 'client/constants'
import { Record } from './Record'

export class PixieFrame extends Record({
    duration: DEFAULT_FRAME_DURATION,
    geometry: null
}) { }
