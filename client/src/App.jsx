import { Authenticated, Unauthenticated } from 'Pixie/Component/Authenticated'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { CaptureNavigate } from './CaptureNavigate'
import { Navigate } from 'react-router'
import { Provider } from 'react-redux'
import { Root } from 'Pixie/Component/Root'
import { Main } from './Page/Main'
import { Workspace } from 'Pixie/Page/Workspace'
import { store } from 'Pixie/Store'

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
