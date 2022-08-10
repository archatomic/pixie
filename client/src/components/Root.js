import { APP_NAME, IS_DESKTOP, IS_MOBILE, IS_WINDOWS, RUNTIME } from 'client/constants'

import { Component } from 'react'
import { Helmet } from 'react-helmet'
import { SafeArea } from 'capacitor-plugin-safe-area'
import { TitleBar } from './title-bar/TitleBar'
import classNames from 'classnames'

export class Root extends Component {
  state = {
    theme: this.getDefaultTheme(),
    focused: document.hasFocus(),
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }

  async componentDidMount() {
    window.addEventListener('focus', () => this.setState({ focused: true }))
    window.addEventListener('blur', () => this.setState({ focused: false }))
    this.rootEl = document.querySelector('.Root')
    this.setState((await SafeArea.getSafeAreaInsets()).insets)
  }

  componentDidUpdate() {
    let style = ''
    style += `border-top: ${this.state.top}px solid transparent;`
    style += `border-right: ${this.state.right}px solid transparent;`
    style += `border-bottom: ${this.state.bottom}px solid transparent;`
    style += `border-left: ${this.state.left}px solid transparent;`
    this.rootEl.setAttribute('style', style)
  }

  getDefaultTheme () {
    try {
      const match = window.matchMedia('(prefers-color-scheme: dark)')
      match.addEventListener('change', this.handleColorSchemePreference)
      if (match.matches) {
        return 'dark'
      } else {
        return 'light'
      }
    } catch (e) {
      return 'light'
    }
  }

  handleColorSchemePreference = match => {
    if (match.matches) {
      this.setState({ theme: 'dark' })
    } else {
      this.setState({ theme: 'light' })
    }
  }

  render () {
    return (
      <>
        <Helmet
          htmlAttributes={{
            class: classNames(
              this.props.pageClassName,
              `Theme--${this.state.theme}`,
              'App',
              `App--${RUNTIME}`,
              {
                'App--focused': this.state.focused,
                'App--mobile': IS_MOBILE,
                'App--web': IS_WINDOWS,
                'App--desktop': IS_DESKTOP
              }
            )
          }}
        >
          <title>{APP_NAME}</title>
        </Helmet>
        <TitleBar>{APP_NAME}</TitleBar>
        {this.props.children}
      </>
    )
  }
}
