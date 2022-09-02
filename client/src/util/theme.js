import { applicationTitleUpdate } from 'client/store/actions/applicationActions'
import { error } from './log'

const THEME_LIGHT = 'light'
const THEME_DARK = 'dark'

let browserDefault = THEME_LIGHT

const updateTheme = (theme) => {
    browserDefault = theme
    applicationTitleUpdate(theme)
}

const handleColorSchemePreference = match => {
    updateTheme(match.matches ? THEME_DARK : THEME_LIGHT)
}

function initBrowserTheme ()
{
    try {
        const match = window.matchMedia('(prefers-color-scheme: dark)')
        match.addEventListener('change', handleColorSchemePreference)
        if (match.matches) updateTheme(THEME_DARK)
        else updateTheme(THEME_LIGHT)
    } catch (e) {
        error(e)
        updateTheme(THEME_LIGHT)
    }
}

initBrowserTheme()

export const getDefaultTheme = () => browserDefault
