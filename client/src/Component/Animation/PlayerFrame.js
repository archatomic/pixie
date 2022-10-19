import { connect } from 'Pixie/util/connect'
import { Frame } from 'Pixie/Component/frame'

export const PlayerFrame = connect(
    (state, props) => ({ frame: state.players.find(props.player).getFrame() }),
    Frame.Connected
)