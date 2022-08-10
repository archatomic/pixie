import './Page.styl'

import { APP_NAME } from 'client/constants'
import { Component } from 'react'
import { HAS_TITLE_BAR } from 'client/constants'
import Helmet from 'react-helmet'
import { Transition } from '../Transition'
import classNames from 'classnames'
import { def } from 'client/util/default'

/**
 * @typedef {object} PageProps
 * @property {string} [title]
 * @property {string} [pageClassName]
 * @property {string} [className]
 * @property {string} [name]
 * @property {boolean} [top]
 * @property {boolean} [tight]
 * @property {import('react').ReactNode} [children]
 */

/**
 * @extends {Component<PageProps>}
 */
export class Page extends Component {
  getTitle () {
    if (this.props.title) {
      return `${this.props.title} | ${APP_NAME}`
    }
    return APP_NAME
  }

  render () {
    return (
      <div
        className={
          classNames(
            'Page',
            {
              [`Page--${this.props.name}`]: this.props.name,
              'Page--top': this.props.top,
              'Page--tight': this.props.tight,
            },
            this.props.className
          )
        }
      >
        <Helmet>
          <title>{this.getTitle()}</title>
        </Helmet>
        <Transition className='Page-top'>
          {this.props.top && this.props.children}
        </Transition>
        <Transition className='Page-body'>
          {!this.props.top && this.props.children}
        </Transition>
      </div>
    )
  }
}
