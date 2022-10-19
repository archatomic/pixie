import {
    APPLICATION_BLUR,
    APPLICATION_CURSOR_UPDATE,
    APPLICATION_FOCUS,
    APPLICATION_LAYERS_TOGGLE,
    APPLICATION_SAFE_AREA_UPDATE,
    APPLICATION_TAB_FOCUS,
    APPLICATION_THEME_TOGGLE,
    APPLICATION_THEME_UPDATE,
    APPLICATION_TIMELINE_TOGGLE,
    APPLICATION_TITLE_UPDATE,
} from 'Pixie/store/actions/applicationActions'

import { Application } from 'Pixie/Model/Application'

const INITIAL_STATE = Application.create()

export const applicationReducer = (application = INITIAL_STATE, action = {}, globalState = null) =>
{
    switch (action.type) {
        case APPLICATION_TITLE_UPDATE:
            return application.setTitle(action.payload)
        case APPLICATION_CURSOR_UPDATE:
            return application.updateCursor(action.payload)
        case APPLICATION_FOCUS:
            return application.focus()
        case APPLICATION_BLUR:
            return application.blur()
        case APPLICATION_THEME_TOGGLE:
            return application.toggleTheme()
        case APPLICATION_THEME_UPDATE:
            return application.set('theme', action.payload)
        case APPLICATION_SAFE_AREA_UPDATE:
            return application.set('safeArea', action.payload)
        case APPLICATION_LAYERS_TOGGLE:
            return application.set('layers', !application.layers)
        case APPLICATION_TIMELINE_TOGGLE:
            return application.set('timeline', !application.timeline)
        case APPLICATION_TAB_FOCUS:
            return application.set('activeTab', action.payload)
    }

    return application
}
