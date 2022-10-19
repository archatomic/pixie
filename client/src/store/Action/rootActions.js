import { action } from 'Pixie/util/action'

export const REPLACE_STATE = 'state.replace'
export const replaceState = (state) => action(REPLACE_STATE, state)
