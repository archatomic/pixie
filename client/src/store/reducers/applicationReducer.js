import {
    APPLICATION_BLUR,
    APPLICATION_CREATE_NEW,
    APPLICATION_CURSOR_UPDATE,
    APPLICATION_FOCUS,
    APPLICATION_LAYERS_TOGGLE,
    APPLICATION_SAFE_AREA_UPDATE,
    APPLICATION_SET_PRIMARY_COLOR,
    APPLICATION_SWAP_COLORS,
    APPLICATION_THEME_UPDATE,
    APPLICATION_TITLE_UPDATE,
    APPLICATION_TOOL_SET
} from 'client/store/actions/applicationActions'

import { Application } from 'client/model/Application'

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
        case APPLICATION_THEME_UPDATE:
            return application.set('theme', action.payload)
        case APPLICATION_SAFE_AREA_UPDATE:
            return application.set('safeArea', action.payload)
        case APPLICATION_CREATE_NEW:
            return application.createNew(action.payload.width, action.payload.height)
        case APPLICATION_TOOL_SET:
            return application.set('tool', action.payload)
        case APPLICATION_LAYERS_TOGGLE:
            return application.set('layers', !application.layers)
        case APPLICATION_SWAP_COLORS:
            return application.merge({
                primaryColor: application.secondaryColor,
                secondaryColor: application.primaryColor
            })
        case APPLICATION_SET_PRIMARY_COLOR:
            return application.set('primaryColor', action.payload)
    }

    return application
}