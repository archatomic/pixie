import { IS_DESKTOP, IS_MOBILE, IS_WEB, RUNTIME } from 'client/constants'
import { applicationBlur, applicationFocus } from 'client/store/actions/applicationActions'

import { Component } from 'react'
import { Helmet } from 'react-helmet'
import { TitleBar } from './title-bar/TitleBar'
import classNames from 'classnames'
import { connect } from 'client/util/connect'

export class Root extends Component
{
  static Connected = connect('application', this)

  componentDidMount ()
  {
    window.addEventListener('focus', applicationFocus)
    window.addEventListener('blur', applicationBlur)
    this.rootEl = document.querySelector('.Root')
    this.componentDidUpdate()
  }

  componentWillUnmount ()
  {
    window.removeEventListener('focus', applicationFocus)
    window.removeEventListener('blur', applicationBlur)
  }

  componentDidUpdate ()
  {
    let style = ''
    const { top, right, bottom, left } = this.props.application.safeArea
    style += `border-top: ${top}px solid black;`
    style += `border-right: ${right}px solid black;`
    style += `border-bottom: ${bottom}px solid black;`
    style += `border-left: ${left}px solid black;`
    this.rootEl.setAttribute('style', style)
  }

  render ()
  {
    return (
      <>
        <Helmet
          htmlAttributes={{
            class: classNames(
              this.props.pageClassName,
              `Theme--${this.props.application.theme}`,
              'App',
              `App--${RUNTIME}`,
              {
                'App--focused': this.props.application.focused,
                'App--unfocused': !this.props.application.focused,
                'App--mobile': IS_MOBILE,
                'App--web': IS_WEB,
                'App--desktop': IS_DESKTOP
              }
            )
          }}
        >
          <title>{this.props.application.title}</title>
        </Helmet>
        <TitleBar>{this.props.application.title}</TitleBar>
        {this.props.children}
      </>
    )
  }
}
