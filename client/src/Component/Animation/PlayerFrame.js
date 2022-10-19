import { connect } from 'Pixie/Util/connect'
import { Frame } from 'Pixie/Component/Frame'

export const PlayerFrame = connect(
    (state, props) => ({ frame: state.players.find(props.player).getFrame() }),
    Frame.Connected
)
