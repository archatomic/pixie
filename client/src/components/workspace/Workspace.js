import './Workspace.styl'

import { Cel } from '../cel/Cel'
import { Component } from 'react'
import { PixieFragment } from 'client/model/PixieFragment'
import { clamp } from 'client/util/clamp'

const OVERFLOW_MARGIN = 10
const MIN_ZOOM = 1
const MAX_ZOOM = 64

export class Workspace extends Component
{
    // Todo: this entire state should live in the store
    state = {
        /** @type {PixieFragment} */
        fragment: PixieFragment.Null,

        /** @type {Number} */
        frame: 0,

        /** @type {Number} */
        zoom: 1,

        /** @type {Number} */
        rotate: 0,

        /** @type {Number} */
        x: 0,

        /** @type {Number} */
        y: 0,

        /** @type {Boolean} */
        cursorDown: false,

        /** @type {Number} */
        cursorX: 0,

        /** @type {Number} */
        cursorY: 0
    }

    /** @type {import('client/model/PixieCel').PixieCel[]} */
    get frameCels ()
    {
        return this.state.fragment
            .getFrameCels(this.state.frame)
            .filter(c => !c.null)
            .toArray()
    }

    get wrapperStyle ()
    {
        return {
            width: `${this.state.fragment.width}px`,
            height: `${this.state.fragment.height}px`,
            transform: `translate(${Math.floor(this.state.x)}px, ${Math.floor(this.state.y)}px) scale(${this.state.zoom}) rotate(${this.state.rotate}deg)`
        }
    }

    get stageStyle ()
    {
        // apply scale
        return {
            width: `${this.state.fragment.width * this.state.zoom}px`,
            height: `${this.state.fragment.height * this.state.zoom}px`,
            transform: `translate(${Math.floor(this.state.x)}px, ${Math.floor(this.state.y)}px) rotate(${this.state.rotate}deg)`
        }
    }

    maxX (zoom = this.state.zoom)
    {
        return (window.innerWidth + zoom * this.state.fragment.width) / 2 - OVERFLOW_MARGIN
    }

    minX (zoom = this.state.zoom)
    {
        return - this.maxX(zoom)
    }

    maxY (zoom = this.state.zoom)
    {
        return (window.innerHeight + zoom * this.state.fragment.height) / 2 - OVERFLOW_MARGIN
    }

    minY (zoom = this.state.zoom)
    {
        return - this.maxY(zoom)
    }

    componentDidMount ()
    {
        const fragment = PixieFragment.create({ numFrames: 4, numLayers: 4 }).fillCels()
        this.setState({
            fragment,
            zoom: Math.min((window.innerWidth - OVERFLOW_MARGIN * 2) / fragment.width, (window.innerHeight - OVERFLOW_MARGIN * 2) / fragment.height)
        })
        window.addEventListener('wheel', this.handleWheel, { passive: false })
        window.addEventListener('mousemove', this.handleMouseMove)
    }

    componentWillUnmount ()
    {
        window.removeEventListener('wheel', this.handleWheel)
        window.removeEventListener('mousemove', this.handleMouseMove)
    }


    handleWheel = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()

        if (!e.ctrlKey) this.translate(-e.deltaX, -e.deltaY)
        else this.zoom(-e.deltaY, e.clientX, e.clientY)
        this.handleMouseMove(e)
    }

    handleMouseMove = ({clientX, clientY}) =>
    {
        if (!this.wrapper) return

        const wrapperRect = this.wrapper.getBoundingClientRect()
        const x = Math.floor((clientX - wrapperRect.left) / this.state.zoom)
        const y = Math.floor((clientY - wrapperRect.top) / this.state.zoom)

        this.setCursor(x, y)
    }

    handleWrapperRef = e => this.wrapper = e

    translate (x, y)
    {
        this.setViewport({
            x: this.state.x + x,
            y: this.state.y + y,
        })
    }

    setCursor (x, y)
    {
        const cursorDown = x > -1 && y > -1 && x < this.state.fragment.width && y < this.state.fragment.height
        const cursorX = cursorDown ? x : 0
        const cursorY = cursorDown ? y : 0

        this.setState({ cursorDown, cursorX, cursorY })
    }

    zoom (amt, originX, originY)
    {
        amt = amt / window.innerHeight // based on window height

        const zSpeed = 3
        let zAmt = zSpeed * amt

        const zoom = clamp(this.state.zoom * (1 + zAmt), MIN_ZOOM, MAX_ZOOM)
        zAmt = zoom / this.state.zoom - 1

        const scaleOriginX = window.innerWidth / 2 + this.state.x
        const offsetX = (originX - scaleOriginX)
        const oDeltaX = - offsetX * zAmt

        const scaleOriginY = window.innerHeight / 2 + this.state.y
        const offsetY = (originY - scaleOriginY)
        const oDeltaY = - offsetY * zAmt
        
        this.setViewport({
            zoom,
            x: this.state.x + oDeltaX,
            y: this.state.y + oDeltaY
        })
    }

    setViewport ({ zoom = this.state.zoom, x = this.state.x, y = this.state.y, rotation = this.state.rotation } = {})
    {
        zoom = clamp(zoom, 1, 64)
        x = clamp(x, this.minX(zoom), this.maxX(zoom))
        y = clamp(y, this.minY(zoom), this.maxY(zoom))
        this.setState({ zoom, x, y, rotation })
    }

    render ()
    {
        return (
            <div className='Workspace'>
                <div className='Workspace-stage' style={this.stageStyle}></div>
                <div className='Workspace-wrapper' style={this.wrapperStyle} ref={this.handleWrapperRef}>
                    {this.renderCursor()}
                    {this.frameCels.map(cel => <Cel className='Workspace-cel' key={cel.pk} cel={cel}/>)}
                </div>
            </div>
        )
    }

    renderCursor ()
    {
        if (!this.state.cursorDown) return null
        let transform = `translate(${this.state.cursorX}px, ${this.state.cursorY}px)`
        return <div className='Workspace-cursor' style={{ transform }}></div>
    }
}