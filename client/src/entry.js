import './global.styl'

import { StatusBar, Style } from '@capacitor/status-bar'

import { App } from 'Pixie/App'
import ReactDOM from 'react-dom/client'
import { SafeArea } from 'capacitor-plugin-safe-area'
import { applicationSafeAreaUpdate } from 'Pixie/Store/Action/applicationActions'
import { createNode } from 'Pixie/Util/createNode'
import { error } from 'Pixie/Util/log'
import { IS_ANDROID } from './constants'
import { registerTools } from 'Pixie/registerTools'
import { addAsepriteSupport } from 'Pixie/Binary/Schema/Aseprite'
import { addPixieSupport } from 'Pixie/Binary/Schema/Pixie'

try {
    module.hot.accept()
} catch (e) {
    // suppress
}

async function setupStatusBar ()
{
    if (!IS_ANDROID) return
    try {
        await StatusBar.setOverlaysWebView({ overlay: true })
        await StatusBar.hide()
    } catch (e) {
        error(e)
    }
}

async function setupSafeAreas ()
{
    const { insets } = await SafeArea.getSafeAreaInsets()
    await applicationSafeAreaUpdate(insets)
}

async function main ()
{
    const root = createNode({
        attrs: { class: 'Root' },
        parent: document.body
    })

    await setupStatusBar()
    await setupSafeAreas()
    await registerTools()
    addAsepriteSupport()
    addPixieSupport()

    ReactDOM.createRoot(root).render(<App />)
}

main()
