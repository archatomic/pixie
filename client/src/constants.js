import { Capacitor } from '@capacitor/core'
import { def } from 'client/util/default'

export const APP_NAME = def(process.env.APP_NAME, document.title)

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
