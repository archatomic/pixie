import { PLAYBACK } from 'Pixie/constants'
import { Record } from 'Pixie/Model/Record'
import { createEnum } from 'Pixie/Util/enum'
import { clamp, mod } from 'Pixie/Util/math'
import { List } from 'immutable'

const OUT_OF_BOUNDS = createEnum([
    'NONE',
    'IGNORE',
    'CLAMP',
    // 'PINGPONG', // @todo: this logic is written, but the datamodel
    // needs adjusted to account for it
    'LOOP'
])

const DEFAULT_OUT_OF_BOUNDS = OUT_OF_BOUNDS.LOOP

export class Player extends Record({
    playback: PLAYBACK.PAUSED,
    progress: 0,
    duration: 0,
    numFrames: 0,
    head: 0,
    frameElapsed: 0,
    speed: 1,
    frame: 0,
    frames: List()
}) {
    _sanitizeFrameIndex (idx, outOfBounds = DEFAULT_OUT_OF_BOUNDS)
    {
        switch (outOfBounds) {
            case OUT_OF_BOUNDS.IGNORE:
                if (idx < 0 || idx >= this.numFrames) return -1
                return idx
            case OUT_OF_BOUNDS.CLAMP:
                return clamp(idx, 0, this.numFrames - 1)
            case OUT_OF_BOUNDS.LOOP:
                return mod(idx, this.numFrames)
            case OUT_OF_BOUNDS.PINGPONG:
                const n = this.numFrames - 1
                return n - Math.abs(mod(idx, n * 2) - n)
            case OUT_OF_BOUNDS.NONE:
            default:
                return idx
        }
    }

    _calculateProgress ()
    {
        let elapsed = this.frameElapsed
        for (let i = 0; i < this.frame - 1; i++) {
            elapsed += this.getFrame(i).duration
        }
        return this.set('progress', elapsed / this.duration)
    }

    getFrame (frame = this.frame, outOfBounds = DEFAULT_OUT_OF_BOUNDS)
    {
        frame = this._sanitizeFrameIndex(frame, outOfBounds)
        const frameID = this.frames.get(frame)
        return this.state.frames.find(frameID)
    }

    setFrame (frame, outOfBounds = DEFAULT_OUT_OF_BOUNDS)
    {
        frame = this._sanitizeFrameIndex(frame, outOfBounds)
        if (frame < 0) return this
        return this.set('frame', frame)
    }

    /**
     * @param {string[]} frames
     *
     * @returns {Player}
     */
    setFrames (frames)
    {
        let duration = 0

        if (frames.toArray) frames = frames.toArray()

        for (const frameID of frames) {
            const frame = this.state.frames.find(frameID)
            duration += frame.duration
        }

        return this.merge({
            duration,
            numFrames: frames.length,
            frames: List(frames)
        }).setFrame(this.frame, OUT_OF_BOUNDS.CLAMP)
    }

    tick (now = Date.now())
    {
        if (this.playback !== PLAYBACK.PLAYING) return this

        let current = this.frame
        let delta = (now - this.head) * this.speed
        let frameElapsed = this.frameElapsed + delta

        let frame = this.getFrame(current)
        let duration = frame.duration * 1000

        // forward playback
        while (frameElapsed > duration) {
            current++
            frameElapsed -= duration
            frame = this.getFrame(current)
            duration = frame.duration * 1000
        }

        return this.setFrame(current).merge({
            head: now,
            frameElapsed
        })._calculateProgress()
    }

    play (now = Date.now())
    {
        if (this.playback === PLAYBACK.PLAYING) return this
        return this.merge({
            playback: PLAYBACK.PLAYING,
            head: now
        })
    }

    pause ()
    {
        if (this.playback === PLAYBACK.PAUSED) return this
        return this.set('playback', PLAYBACK.PAUSED)
    }

    stop ()
    {
        return this.merge({
            playback: PLAYBACK.PAUSED,
            frame: 0, // Reset frame
            frameElapsed: 0,
            head: 0,
        })
    }
}
