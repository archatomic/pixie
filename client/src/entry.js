import './global.styl'

import { StatusBar, Style } from '@capacitor/status-bar'

import { App } from 'client/App'
import ReactDOM from 'react-dom/client'
import { SafeArea } from 'capacitor-plugin-safe-area'
import { applicationSafeAreaUpdate } from 'client/store/actions/applicationActions'
import { createNode } from 'client/util/createNode'
import { error } from 'client/util/log'
import { IS_ANDROID } from './constants'
import { registerTools } from 'client/registerTools'

if (module?.hot) {
  module.hot.accept()
}

async function setupStatusBar ()
{
  if (!IS_ANDROID) return
  try {
    await StatusBar.setOverlaysWebView({ overlay: true })
  } catch (e) {
    error(e)
  }
}

async function setupSafeAreas ()
{
  const { insets } = await SafeArea.getSafeAreaInsets()
  await applicationSafeAreaUpdate(insets)
}

async function main () {
  const root = createNode({
    attrs: { class: 'Root' },
    parent: document.body
  })

  await setupStatusBar()
  await setupSafeAreas()
  await registerTools()

  ReactDOM.createRoot(root).render(<App />)
}

main()
