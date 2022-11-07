import { Action } from 'Pixie/Component/Action'
import { go } from 'Pixie/Util/navigate'
import { Component } from 'react'

export class Redirect extends Component
{
    handleRedirect = () =>
    {
        go(this.props.to)
    }

    render ()
    {
        return <Action do={this.handleRedirect}/>
    }
}
