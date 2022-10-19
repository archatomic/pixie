import { PlayerFrame } from './PlayerFrame'
import { CEL_DISPLAY_MODE } from 'Pixie/constants'
import { Player } from 'Pixie/model/Player'
import
{
    playerActions,
    setPlayerFrames,
    tickPlayer
} from 'Pixie/store/actions/playerActions'
import { connect } from 'Pixie/util/connect'
import { safeCall } from 'Pixie/util/safeCall'
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
        return <PlayerFrame
            player={this.state.player}
            celDisplayMode={CEL_DISPLAY_MODE.COMMITTED}
        />
    }
}
