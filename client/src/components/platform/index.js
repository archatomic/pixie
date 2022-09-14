import { IS_ANDROID, IS_DESKTOP, IS_IOS, IS_LINUX, IS_MAC, IS_MOBILE, IS_WEB, IS_WINDOWS } from 'client/constants'

import { createPassthroughComponent } from 'client/util/children'

const NOOP_COMPONENT = () => null
const staticConditionalRenderer = condition => (condition ? createPassthroughComponent() : NOOP_COMPONENT)

export const Android = staticConditionalRenderer(IS_ANDROID)
export const NotAndroid = staticConditionalRenderer(!IS_ANDROID)

export const IOS = staticConditionalRenderer(IS_IOS)
export const NotIOS = staticConditionalRenderer(!IS_IOS)

export const Mobile = staticConditionalRenderer(IS_MOBILE)
export const NotMobile = staticConditionalRenderer(!IS_MOBILE)

export const Mac = staticConditionalRenderer(IS_MAC)
export const NotMac = staticConditionalRenderer(!IS_MAC)

export const Linux = staticConditionalRenderer(IS_LINUX)
export const NotLinux = staticConditionalRenderer(!IS_LINUX)

export const Windows = staticConditionalRenderer(IS_WINDOWS)
export const NotWindows = staticConditionalRenderer(!IS_WINDOWS)

export const Desktop = staticConditionalRenderer(IS_DESKTOP)
export const NotDesktop = staticConditionalRenderer(!IS_DESKTOP)

export const Web = staticConditionalRenderer(IS_WEB)
export const NotWeb = staticConditionalRenderer(!IS_WEB)
