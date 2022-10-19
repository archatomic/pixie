import { Component } from 'react'

/**
 * @extends {Component<{do: () => void}>}
 */
export class Action extends Component {
  componentDidMount () {
    this.props.do()
  }

  render () {
    return null
  }
}
