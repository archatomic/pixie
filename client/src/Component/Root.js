import { IS_ANDROID, IS_DESKTOP, IS_MOBILE, IS_WEB, RUNTIME } from 'Pixie/constants'
import { applicationBlur, applicationFocus } from 'Pixie/Store/Action/applicationActions'

import { Component } from 'react'
import { Helmet } from 'react-helmet'
import classNames from 'classnames'
import { connect } from 'Pixie/Util/connect'
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar'
import { onFrame } from 'Pixie/Util/frame'

export class Root extends Component
{
    static Connected = connect(state => ({
        safeArea: state.application.safeArea,
        theme: state.application.theme,
        focused: state.application.focused,
        title: state.application.title
    }), this)

    componentDidMount ()
    {
        window.addEventListener('focus', applicationFocus)
        window.addEventListener('blur', applicationBlur)
        this.rootEl = document.querySelector('.Root')
        this.componentDidUpdate()
        this.updateNavBarColor()
        onFrame(this.updateNavBarColor)
    }

    updateNavBarColor = async () =>
    {
        if (!IS_ANDROID) return
        const page = document.querySelector('.Page-body')
        let color = page ? window.getComputedStyle(page).backgroundColor : '#13151b'
        let darkButtons = false

        if (color.startsWith('rgb')) {
            const [r, g, b] = color.replace(/[^\d,]/g, '').split(',').map(p => parseInt(p, 10))

            color = '#'
            color += r.toString(16).padStart(2, '0')
            color += g.toString(16).padStart(2, '0')
            color += b.toString(16).padStart(2, '0')
            darkButtons = (r + g + b) / 3 > 120
        }

        await this.setNavBar(color, darkButtons)
    }

    async setNavBar (color, darkButtons)
    {
        if (this.color === color && this.darkButtons === darkButtons) return
        this.color = color
        this.darkButtons = darkButtons
        await NavigationBar.setColor({ color, darkButtons })
    }

    componentWillUnmount ()
    {
        window.removeEventListener('focus', applicationFocus)
        window.removeEventListener('blur', applicationBlur)
    }

    componentDidUpdate ()
    {
        let style = ''
        const { top, right, bottom, left } = this.props.safeArea
        style += `border-top-width: ${top}px;`
        style += `border-right-width: ${right}px;`
        style += `border-bottom-width: ${bottom}px;`
        style += `border-left-width: ${left}px;`
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
                            `Theme--${this.props.theme}`,
                            'App',
                            `App--${RUNTIME}`,
                            {
                                'App--focused': this.props.focused,
                                'App--unfocused': !this.props.focused,
                                'App--mobile': IS_MOBILE,
                                'App--web': IS_WEB,
                                'App--desktop': IS_DESKTOP
                            }
                        )
                    }}
                >
                    <title>{this.props.title}</title>
                </Helmet>
                {this.props.children}
                {this.renderModalLayer()}
            </>
        )
    }

    renderModalLayer ()
    {

    }
}
