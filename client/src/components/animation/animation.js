import { Image } from 'client/components/image'
import { Player } from 'client/model/Player'
import { playerActions, setPlayerFrames, tickPlayer } from 'client/store/actions/playerActions'
import { connect } from 'client/util/connect'
import { safeCall } from 'client/util/safeCall'
import { Component } from 'react'

export class Animation extends Component
{
    static FromFragment = connect(
        (state, props) =>
        {
            const fragment = state.fragments.find(props.fragment)
            const frames = fragment.frames
            return {
                frames
            }
        },
        this
    )

    state = {
        player: null
    }

    componentDidMount ()
    {
        let player = this.props.player || Player.create()
        if (this.props.frames) player = player.setFrames(this.props.frames)
        if (this.props.frame) player = player.setFrame(this.props.frame)
        if (this.props.speed) player = player.set('speed', this.props.speed)
        if (this.props.autoplay) player = player.play()

        playerActions.save(player)
        safeCall(this.props.onPlayer, player)

        this.setState({ player: player.pk })
        this._raf = requestAnimationFrame(this.loop)
    }

    componentWillUnmount ()
    {
        playerActions.delete(this.state.player)
        cancelAnimationFrame(this._raf)
    }

    componentDidUpdate (props)
    {
        if (props.frames !== this.props.frames) {
            setPlayerFrames(this.state.player, this.props.frames.toArray())
        }
    }

    loop = () =>
    {
        tickPlayer(this.state.player)
        this._raf = requestAnimationFrame(this.loop)
    }

    render ()
    {
        if (!this.state.player) return
        return <AnimationFrame.FromPlayerId player={this.state.player} />
    }
}

class AnimationFrame extends Component
{
    static FromFrame = connect(
        (state, props) =>
        {
            const frame = state.frames.find(props.frame)
            const fragment = state.fragments.find(frame.fragment)
            const cels = fragment.getCels({ frame: frame.pk, visible: true }).map(c => c.cel)
            return {
                cels: state.cels.findAll(cels).toArray()
            }
        },
        this
    )
    
    static FromPlayerId = connect(
        (state, props) =>
        {
            return {
                frame: state.players.find(props.player).getFrame()
            }
        },
        this.FromFrame
    )

    render ()
    {
        return (
            <div className='Animation'>
                {this.props.cels.map((cel, i) => <Image key={i} className='Animation-cel' data={cel.data} />)}
            </div>
        )
    }
}
