import { Player } from 'Pixie/Model/Player'
import { PLAYER_PAUSE, PLAYER_PLAY, PLAYER_SET_FRAMES, PLAYER_STOP, PLAYER_TICK } from 'Pixie/Store/Action/playerActions'

const INITIAL_STATE = Player.Collection.create()
const COLLECTION_REDUCER = Player.Collection.createReducer('player')

export const playerReducer = (players = INITIAL_STATE, action = {}, globalState = null) =>
{
    let player
    switch (action.type) {
        case PLAYER_PLAY:
            player = players.find(action.payload.id)
            if (player.null) return players
            return players.add(player.play())
        case PLAYER_PAUSE:
            player = players.find(action.payload.id)
            if (player.null) return players
            return players.add(player.pause())
        case PLAYER_STOP:
            player = players.find(action.payload.id)
            if (player.null) return players
            return players.add(player.pause())
        case PLAYER_SET_FRAMES:
            player = players.find(action.payload.id)
            if (player.null) return players
            return players.add(player.setFrames(action.payload.frames, globalState))
        case PLAYER_TICK:
            player = players.find(action.payload.id)
            if (player.null) return players
            return players.add(player.tick(action.payload.now))
        default:
            return COLLECTION_REDUCER(players, action, globalState)
    }

    return players
}
