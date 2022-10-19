import classNames from 'classnames'
import { Frame } from 'Pixie/components/frame'
import { connect } from 'Pixie/util/connect'
import { clamp, mod } from 'Pixie/util/math'
import { Component } from 'react'

/**
 * @typedef {object} OnionProps
 * @property {string[]} frames
 * @property {Number} position
 * @property {Number} count
 * @property {string} [className]
 */

/**
 * @extends {Component<OnionProps>}
 */
export class Onion extends Component
{
    static FromFragment = connect(
        (state, props) =>
        {
            const fragment = state.fragments.find(props.fragment)
            return {
                frames: fragment.frames.toArray()
            }
        },
        this
    )

    getBefore ()
    {
        const count = clamp(
            this.props.count,
            0,
            Math.ceil((this.props.frames.length - 1) / 2)
        )

        return this.getFrames(
            this.props.position - count,
            this.props.position - 1
        )
    }

    getAfter ()
    {
        const count = clamp(
            this.props.count,
            0,
            Math.floor((this.props.frames.length - 1) / 2)
        )

        return this.getFrames(
            this.props.position + 1,
            this.props.position + count
        )
    }

    getFrame (idx)
    {
        idx = mod(idx, this.props.frames.length)
        return this.props.frames[idx]
    }

    getFrames (from, to, clampFrames = false)
    {
        if (this.props.frames.length == 0) return []

        if (clampFrames) {
            from = clamp(from, 0, this.props.frames.length - 1)
            to = clamp(to, 0, this.props.frames.length - 1)
        }

        const op = []
        for (let i = from; i <= to; i++)
        {
            op.push(this.getFrame(i))
        }
        return op
    }

    render ()
    {
        const frame = this.getFrame(this.props.position)
            
        return (
            <div className={classNames('Onion', this.props.className)}>
                {this.renderBefore()}
                {this.renderAfter()}
                <Frame.Connected className='Onion-frame' frame={frame} />
            </div>
        )
    }

    renderBefore ()
    {
        const before = this.getBefore()
        return this.renderOnionSkins(before, 'Onion-before', 'Onion-frame--before')
    }

    renderAfter ()
    {
        const after = this.getAfter()
        return this.renderOnionSkins(after.reverse(), 'Onion-after', 'Onion-frame--after')
    }

    renderOnionSkins (frames, className, skinClass)
    {
        if (!frames.length) return null

        return (
            <div className={className}>
                {frames.map((frame, i) =>
                    {
                        const distance = (i + 1) / frames.length
                        return this.renderOnionSkin(frame, distance, skinClass)
                    }
                )}
            </div>
        )
    }

    renderOnionSkin (frame, distance, className)
    {
        return <Frame.Connected
            key={frame}
            frame={frame}
            className={classNames('Onion-frame', className)}
            style={{opacity: distance }}
        />
    }
}