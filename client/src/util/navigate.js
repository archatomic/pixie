import { locate } from './registry'

export const navigate = (to, opts) => locate('navigate')(to, opts)
export const back = (steps = 1) => navigate(-steps)
export const forward = (steps = 1) => navigate(steps)
export const replace = (to) => navigate(to, { replace: true })
export const go = (to) => navigate(to)
