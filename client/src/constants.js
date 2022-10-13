import { Capacitor } from '@capacitor/core'
import { def } from 'client/util/default'
import { createEnum } from 'client/util/enum'

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

export const HAS_TITLE_BAR = IS_DESKTOP
// TODO: Support mouse on mobile?

// GRAPHICS
export const DEFAULT_FRAGMENT_WIDTH = def(process.env.DEFAULT_FRAGMENT_WIDTH, 48)
export const DEFAULT_FRAGMENT_HEIGHT = def(process.env.DEFAULT_FRAGMENT_HEIGHT, 64)
export const DEFAULT_FRAGMENT_NUM_LAYERS = def(process.env.DEFAULT_FRAGMENT_NUM_LAYERS, 1)
export const DEFAULT_FRAGMENT_NUM_FRAMES = def(process.env.DEFAULT_FRAGMENT_NUM_FRAMES, 1)
export const DEFAULT_FRAME_DURATION = def(process.env.DEFAULT_FRAME_DURATION, 1 / 12)

// tools
export const TOOL = createEnum([
    'PENCIL',
    'ERASER',
    'EYEDROPPER',
    'MOVE',
    'PAN',
    'ZOOM',
    'SELECT',
    'FILL'
])

export const TOOLOPT = createEnum([
    'PENCIL_SIZE',
    'ERASER_SIZE',
    'COLOR'
])

export const MIN_ZOOM = 1
export const MAX_ZOOM = 64
export const ZOOM_SPEED = 10

export const MAX_FPS = 60
export const MIN_FPS = 0.1
export const MAX_FRAME_DURATION = 1 / MIN_FPS
export const MIN_FRAME_DURATION = 1 / MAX_FPS

export const BLENDMODE = createEnum([
    'REPLACE',
    'ALPHA',
    // todo: multiply, dodge, etc...
])

export const OVERFLOW = createEnum([
    'NONE',
    'REPEAT'
])

export const VISIBILITY = createEnum([
    'VISIBLE',
    'HIDDEN',
    'SOLO'
])

export const PLAYBACK = createEnum([
    'PLAYING',
    'PAUSED'
])