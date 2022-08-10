import { Component } from 'react'
import { identity } from 'client/api/identity'

export class Authenticated extends Component {
  state = {
    authenticated: !!identity.getTokens()
  }

  componentDidMount () {
    identity.on('auth', this.handleAuthenticationChanged)
    this.handleAuthenticationChanged(identity.getTokens())
    this.getPermissions()
  }

  componentWillUnmount () {
    identity.off('auth', this.handleAuthenticationChanged)
  }

  // TODO: This should go into a more global placed. Maybe a data store?
  async getPermissions () {
    if (!this.state.authenticated || !this.shouldRender()) return
    const permissions = await identity.get('auth/current')
    // store this
    console.log(permissions.payload)
  }

  async componentDidUpdate (_, state) {
    if (!state.authenticated) this.getPermissions()
  }

  handleAuthenticationChanged = tokens => {
    this.setState({ authenticated: !!tokens })
  }

  shouldRender () {
    return this.state.authenticated
  }

  render () {
    if (!this.shouldRender()) return null
    return <>{this.props.children}</>
  }
}

export class Unauthenticated extends Authenticated {
  shouldRender () {
    return !this.state.authenticated
  }
}
