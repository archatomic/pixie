import { Capacitor } from '@capacitor/core'
import { def } from 'client/util/default'

export const APP_NAME = def(process.env.APP_NAME, 'Pixie')

// PLATFORM
export const ANDROID = 'android'
export const IOS = 'ios'
export const MAC = 'mac'
export const WINDOWS = 'windows'
export const LINUX = 'linux'
export const WEB = 'web'

const MOCK_RUNTIME = null

const getRuntime = () => {
    if (MOCK_RUNTIME) return MOCK_RUNTIME

    const { isMac, isLinux, isWindows } = def(window.electron, {})
    if (isMac) return MAC
    if (isLinux) return LINUX
    if (isWindows) return WINDOWS

    const platform = Capacitor.getPlatform()
    if (platform === ANDROID) return ANDROID
    if (platform === IOS) return IOS

    return WEB
}

export const RUNTIME = getRuntime()

export const IS_ANDROID = RUNTIME === ANDROID
export const IS_IOS = RUNTIME === IOS
export const IS_MOBILE = IS_ANDROID || IS_IOS

export const IS_MAC = RUNTIME === MAC
export const IS_LINUX = RUNTIME === LINUX
export const IS_WINDOWS = RUNTIME === WINDOWS
export const IS_DESKTOP = IS_MAC || IS_LINUX || IS_WINDOWS

export const IS_WEB = RUNTIME === WEB

export const HAS_OS_MENU = IS_DESKTOP
export const HAS_TITLE_BAR = IS_DESKTOP
export const SUPPORTS_TABS = !IS_MOBILE
export const SUPPORTS_MOUSE = IS_DESKTOP || IS_WEB
// TODO: Support mouse on mobile?

// GRAPHICS
export const DEFAULT_FRAGMENT_WIDTH = def(process.env.DEFAULT_FRAGMENT_WIDTH, 48)
export const DEFAULT_FRAGMENT_HEIGHT = def(process.env.DEFAULT_FRAGMENT_HEIGHT, 64)
export const DEFAULT_FRAGMENT_NUM_LAYERS = def(process.env.DEFAULT_FRAGMENT_NUM_LAYERS, 1)
export const DEFAULT_FRAGMENT_NUM_FRAMES = def(process.env.DEFAULT_FRAGMENT_NUM_FRAMES, 1)
export const DEFAULT_FRAME_DURATION = def(process.env.DEFAULT_FRAME_DURATION, 1 / 12)

// tools
export const TOOL_PENCIL = 'pencil'
export const TOOL_ERASER = 'eraser'
export const TOOL_EYEDROPPER = 'eyedropper'
export const TOOL_MOVE = 'move'
export const TOOL_PAN = 'pan'
export const TOOL_ZOOM = 'zoom'
export const TOOL_SELECT = 'select'
export const TOOL_FILL = 'fill'