import './global.styl'

import { App } from 'client/App'
import ReactDOM from 'react-dom/client'
import { createNode } from 'client/util/createNode'

//import { identity } from 'client/api/identity'
//identity.setScope(['identity'])

if (module.hot) {
  module.hot.accept()
}

async function main () {
  const root = createNode({
    attrs: { class: 'Root' },
    parent: document.body
  })

  ReactDOM.createRoot(root).render(<App />)
}

main()
