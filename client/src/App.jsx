import { Authenticated, Unauthenticated } from 'client/components/Authenticated'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Main } from './pages/Main/Main'
import { Navigate } from 'react-router'
import { Provider } from 'react-redux'
import { Root } from 'client/components/Root'
import { store } from 'client/store'

const AuthenticatedRoutes = null
const UnathenticatedRoutes = (
  <Routes>
    <Route path='/' element={<Main />} />
    <Route path='*' element={<Navigate to='/' />} />
  </Routes>
)

export const App = () => (
  <Provider store={store}>
      <BrowserRouter>
        <Root>
            <Authenticated>{AuthenticatedRoutes}</Authenticated>
            <Unauthenticated>{UnathenticatedRoutes}</Unauthenticated>
        </Root>
      </BrowserRouter>
  </Provider>
)