import { applicationTitleClear, applicationTitleUpdate } from 'Pixie/store/actions/applicationActions'

import { Component } from 'react'
import { Transition } from '../Transition'
import classNames from 'classnames'

/**
 * @typedef {object} PageProps
 * @property {string} [title]
 * @property {string} [pageClassName]
 * @property {string} [className]
 * @property {string} [name]
 * @property {boolean} [top]
 * @property {boolean} [tight]
 * @property {boolean} [accent]
 * @property {import('react').ReactNode} [children]
 */

/**
 * @extends {Component<PageProps>}
 */
export class Page extends Component
{
    componentDidMount ()
    {
        applicationTitleUpdate(this.props.title)
    }

    componentWillUnmount ()
    {
        applicationTitleClear()
    }

    render ()
    {
        return (
            <div
                className={
                    classNames(
                        'Page',
                        {
                            [`Page--${this.props.name}`]: this.props.name,
                            'Page--top': this.props.top,
                            'Page--accent': this.props.accent,
                            'Page--tight': this.props.tight,
                        },
                        this.props.className
                    )
                }
            >
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
