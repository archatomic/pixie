import { Authenticated, Unauthenticated } from 'client/components/Authenticated'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

import { Action } from 'client/components/Action'
import { Navigate } from 'react-router'
import { Page } from 'client/components/page/Page'
import { Root } from 'client/components/Root'

//import { Login } from './pages/Login'


//import { identity } from 'common/api/identity'

//const logout = identity.logout.bind(identity)

const logout = () => alert('logout')
const Login = () => <Page title='login'>login</Page>

export const App = () => (
  <Root>
    <BrowserRouter>
      <Authenticated>
        <Routes>
          <Route path='/' element={<Page title='Signed In'>Signed In <Link to='/sign-out'>Sign Out</Link></Page>} />
          <Route path='sign-out' element={<Action do={logout} />} />
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </Authenticated>
      <Unauthenticated>
        <Routes>
          <Route path='sign-in' element={<Login />} />
          <Route path='*' element={<Navigate to='/sign-in' />} />
        </Routes>
      </Unauthenticated>
    </BrowserRouter>
  </Root>
)
