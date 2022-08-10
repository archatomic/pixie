import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { Children } from 'react'

const addEndListener = (node, done) => {
  // use the css transitionend event to mark the finish of a transition
  node.addEventListener('transitionend', done, false)
}

export const Transition = ({ className = null, children = null, timeout = null } = {}) => {
  return (
    <TransitionGroup className={className}>
      {Children.toArray(children).map((child, i) => {
        if (typeof child === 'string') child = <span>{child}</span>
        const props = timeout ? { timeout } : { addEndListener }
        const key = child?.key || i
        return <CSSTransition key={key} {...props}>{child}</CSSTransition>
      })}
    </TransitionGroup>
  )
}
