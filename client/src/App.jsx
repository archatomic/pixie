import { Authenticated, Unauthenticated } from 'Pixie/components/Authenticated'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { CaptureNavigate } from './CaptureNavigate'
import { Main } from './pages/Main/Main'
import { Navigate } from 'react-router'
import { Provider } from 'react-redux'
import { Root } from 'Pixie/components/Root'
import { Workspace } from 'Pixie/pages/Workspace/Workspace'
import { store } from 'Pixie/store'

const AuthenticatedRoutes = null
const UnathenticatedRoutes = (
  <Routes>
    <Route path='/' element={<Main />} />
    <Route path='/workspace' element={<Workspace />} />
    <Route path='*' element={<Navigate to='/' />} />
  </Routes>
)

export const App = () => (
  <Provider store={store}>
    <BrowserRouter>
        <CaptureNavigate />
        <Root.Connected>
            <Authenticated>{AuthenticatedRoutes}</Authenticated>
            <Unauthenticated>{UnathenticatedRoutes}</Unauthenticated>
        </Root.Connected>
      </BrowserRouter>
  </Provider>
)