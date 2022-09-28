import { action, collectionActions } from 'client/util/action'

import { register } from 'client/util/registry'

export const APPLICATION_TITLE_UPDATE = 'application.title.update'
export const applicationTitleUpdate = (title) => action(APPLICATION_TITLE_UPDATE, title)
export const applicationTitleClear = () => action(APPLICATION_TITLE_UPDATE)

export const APPLICATION_SAFE_AREA_UPDATE = 'application.safeArea.update'
export const applicationSafeAreaUpdate = (safeArea) =>
{
    register('safeArea', safeArea)
    return action(APPLICATION_SAFE_AREA_UPDATE, safeArea)
}

export const APPLICATION_THEME_TOGGLE = 'application.theme.toggle'
export const applicationThemeToggle = () => action(APPLICATION_THEME_TOGGLE)

export const APPLICATION_THEME_UPDATE = 'application.theme.update'
export const applicationThemeUpdate = (theme) => action(APPLICATION_THEME_UPDATE, theme)

export const APPLICATION_FOCUS = 'application.focus'
export const applicationFocus = () => action(APPLICATION_FOCUS)

export const APPLICATION_BLUR = 'application.blur'
export const applicationBlur = () => action(APPLICATION_BLUR)

export const APPLICATION_CURSOR_UPDATE = 'application.cursor.update'
export const applicationCursorUpdate = (x, y, down) => action(APPLICATION_CURSOR_UPDATE, { x, y, down })

export const APPLICATION_TAB_OPEN = 'application.tab.open'
export const applicationTabOpen = (fragment) => action(APPLICATION_TAB_OPEN, fragment)

export const APPLICATION_TAB_CLOSE = 'application.tab.close'
export const applicationTabClose = (tab) => action(APPLICATION_TAB_CLOSE, tab)

export const APPLICATION_CREATE_NEW = 'application.create.new'
export const applicationCreateNew = (width, height) => action(APPLICATION_CREATE_NEW, { width, height })

export const tabActions = collectionActions('tab')
export const fragmentActions = collectionActions('fragment')

export const APPLICATION_TOOL_SET = 'application.tool.set'
export const applicationToolSet = (tool) => action(APPLICATION_TOOL_SET, tool)

export const APPLICATION_LAYERS_TOGGLE = 'application.layers.toggle'
export const applicationLayersToggle = () => action(APPLICATION_LAYERS_TOGGLE)

export const APPLICATION_TIMELINE_TOGGLE = 'application.timeline.toggle'
export const applicationTimelineToggle = () => action(APPLICATION_TIMELINE_TOGGLE)

export const APPLICATION_CREATE_LAYER = 'application.layers.create'
export const applicationCreateLayer = (count = 1, at = null) => action(APPLICATION_CREATE_LAYER, { count, at })
