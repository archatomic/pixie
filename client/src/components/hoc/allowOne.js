import { Component } from 'react'
import { Emitter } from 'client/util/emitter'
import { safeCall } from 'client/util/safeCall'

const OPEN_EVENT = 'open'
const CLOSE_EVENT = 'close'
const DEFAULT_CHANNEL = '__default_channel'
const CHANNELS = {}

export function close(channel = DEFAULT_CHANNEL) {
    if (!CHANNELS[channel]) return
    CHANNELS[channel].emit(CLOSE_EVENT)
}

export function allowOne (WrappedComponent, openAutomatically = true, channel = DEFAULT_CHANNEL)
{
    if (!CHANNELS[channel]) CHANNELS[channel] = new Emitter()
    channel = CHANNELS[channel]

    return class extends Component
    {
        state = {
            open: false
        }

        componentDidMount ()
        {
            this.unsub = [
                channel.listen(OPEN_EVENT, this.handleOpen),
                channel.listen(CLOSE_EVENT, this.handleClose)
            ]
            if (openAutomatically) this.open()
        }

        componentWillUnmount ()
        {
            this.unsub.forEach(u => u())
        }

        open ()
        {
            if (this.state.open) return
            channel.emit(OPEN_EVENT, this)
        }

        close ()
        {
            if (!this.state.open) return
            channel.emit(CLOSE_EVENT)
        }

        handleOpen = (instance) =>
        {
            const open = instance === this
            if (open !== this.state.open) this.setState({ open })
        }

        handleClose = () =>
        {
            if (this.state.open) this.setState({ open: false })
        }

        componentDidUpdate (_, state)
        {
            if (state.open && !this.state.open) safeCall(this.props.onClose)
            if (!state.open && this.state.open) safeCall(this.props.onOpen)
        }

        handleOpenFromChild = () => this.open()
        handleCloseFromChild = () => this.close()

        render ()
        {
            if (!this.state.open) return null
            return <WrappedComponent {...this.props} onOpen={this.handleOpenFromChild} onClose={this.handleCloseFromChild}/>
        }
    }
}
