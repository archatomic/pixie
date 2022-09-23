import './global.styl'

import { StatusBar, Style } from '@capacitor/status-bar'

import { App } from 'client/App'
import { IS_ANDROID } from './constants'
import ReactDOM from 'react-dom/client'
import { SafeArea } from 'capacitor-plugin-safe-area'
import { applicationSafeAreaUpdate } from 'client/store/actions/applicationActions'
import { createNode } from 'client/util/createNode'
import { error } from 'client/util/log'

if (module.hot) {
  module.hot.accept()
}

async function main () {
  const root = createNode({
    attrs: { class: 'Root' },
    parent: document.body
  })

  try {
    if (IS_ANDROID) await StatusBar.setOverlaysWebView({ overlay: true })
  } catch (e) {
    error(e)
  }

  const { insets } = await SafeArea.getSafeAreaInsets()
  await applicationSafeAreaUpdate(insets)

  ReactDOM.createRoot(root).render(<App />)
}

main()
