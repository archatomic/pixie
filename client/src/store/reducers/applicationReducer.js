import {
    APPLICATION_BLUR,
    APPLICATION_CREATE_NEW,
    APPLICATION_CURSOR_UPDATE,
    APPLICATION_FOCUS,
    APPLICATION_LAYERS_TOGGLE,
    APPLICATION_SAFE_AREA_UPDATE,
    APPLICATION_SET_PRIMARY_COLOR,
    APPLICATION_THEME_UPDATE,
    APPLICATION_TITLE_UPDATE,
    APPLICATION_THEME_TOGGLE,
    APPLICATION_TOOL_SET,
    APPLICATION_TIMELINE_TOGGLE,
    APPLICATION_SET_BRUSH_SIZE,
    APPLICATION_SET_ERASER_SIZE
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
        case APPLICATION_THEME_TOGGLE:
            return application.toggleTheme()
        case APPLICATION_THEME_UPDATE:
            return application.set('theme', action.payload)
        case APPLICATION_SAFE_AREA_UPDATE:
            return application.set('safeArea', action.payload)
        case APPLICATION_CREATE_NEW:
            return application.createNew(action.payload.width, action.payload.height)
        case APPLICATION_LAYERS_TOGGLE:
            return application.set('layers', !application.layers)
        case APPLICATION_TIMELINE_TOGGLE:
            return application.set('timeline', !application.timeline)

        // case APPLICATION_TOOL_SET:
        //     return application.set('tool', action.payload)
        // case APPLICATION_SET_PRIMARY_COLOR:
        //     return application.set('primaryColor', action.payload)
        // case APPLICATION_SET_BRUSH_SIZE:
        //     return application.set('pencilSize', action.payload)
        // case APPLICATION_SET_ERASER_SIZE:
        //     return application.set('eraserSize', action.payload)
    }

    return application
}