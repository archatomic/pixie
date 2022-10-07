import { VISIBILITY } from 'client/constants'
import { Record } from './Record'

export class PixieLayer extends Record({
    name: 'New Layer',
    visibility: VISIBILITY.VISIBLE
}) {
    get visible ()
    {
        return this.visibility === VISIBILITY.VISIBLE
    }

    get soloed ()
    {
        return this.visibility === VISIBILITY.SOLO
    }

    get hidden ()
    {
        return this.visibility === VISIBILITY.HIDDEN
    }

    isVisible (soloing)
    {
        // Visible no matter what
        if (this.soloed) return true

        // Only visible if we're not soloing
        if (this.visible) return !soloing

        // Must be hidden
        return false
    }
}