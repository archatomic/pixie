import { VISIBILITY } from 'client/constants'
import { Record } from './Record'

export class PixieLayer extends Record({
    fragment: null,
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

    active ()
    {
        const active = this.state.tabs.where({ fragment: this.fragment }).first()?.layer
        if (active === this.pk) return true // explicit active layer
        return this.position() === active
    }

    isVisible ()
    {
        if (this.soloed) return true
        if (this.hidden) return false

        return this.state.layers.where({
            fragment: this.fragment,
            visibility: VISIBILITY.SOLO
        }).count() === 0
    }

    position ()
    {
        const fragment = this.state.fragments.find(this.fragment)
        return fragment.layers.indexOf(this.pk) 
    }
}