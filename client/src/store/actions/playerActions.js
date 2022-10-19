import { action, collectionActions } from 'Pixie/util/action'

export const PLAYER_PLAY = 'player.play'
export const playPlayer = (id) => action(PLAYER_PLAY, { id })

export const PLAYER_PAUSE = 'player.pause'
export const pausePlayer = (id) => action(PLAYER_PAUSE, { id })

export const PLAYER_STOP = 'player.stop'
export const stopPlayer = (id) => action(PLAYER_STOP, { id })

export const PLAYER_SET_FRAMES = 'player.setFrames'
export const setPlayerFrames = (id, frames) => action(PLAYER_SET_FRAMES, { id, frames })

export const PLAYER_TICK = 'player.tick'
export const tickPlayer = (id, now = undefined) => action(PLAYER_TICK, { id, now })

export const playerActions = collectionActions('player')
