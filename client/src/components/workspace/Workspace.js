import './Workspace.styl'

import { applicationCreateNew, applicationCursorUpdate, tabActions } from 'client/store/actions/applicationActions'

import { Cel } from '../cel/Cel'
import { Component } from 'react'
import { clamp } from 'client/util/clamp'
import { connect } from 'client/util/connect'

const OVERFLOW_MARGIN = 20
const MIN_ZOOM = 1
const MAX_ZOOM = 64
const ZOOM_SPEED = 10

/**
 * @typedef {object} WorkspaceProps
 * @prop {import('client/model/Application').Application} application
 */

/**
 * @extends {Component<WorkspaceProps>}
 */
export class Workspace extends Component
{
    static Connected = connect(
        {
            'cursorDown': ['application', 'cursorDown'],
            'cursorX': ['application', 'cursorX'],
            'cursorY': ['application', 'cursorY'],
            'tab': (state) => state.get('application').getActiveTab(),
            'fragment': (state) => state.get('application').getActiveFragment(),
        },
        this
    )

    get tab ()
    {
        return this.props.tab
    }

    get fragment ()
    {
        return this.props.fragment
    }

    /** @type {import('client/model/PixieCel').PixieCel[]} */
    get frameCels ()
    {
        // TODO: Respect "inherited"
        return this.fragment
            .getFrameCels(this.tab.frame)
            .filter(c => !c.null)
            .toArray()
    }

    get wrapperStyle ()
    {
        return {
            width: `${this.fragment.width}px`,
            height: `${this.fragment.height}px`,
            transform: `translate(${Math.floor(this.tab.x)}px, ${Math.floor(this.tab.y)}px) scale(${this.tab.zoom}) rotate(${this.tab.rotate}deg)`
        }
    }

    get stageStyle ()
    {
        // apply scale
        return {
            width: `${this.fragment.width * this.tab.zoom}px`,
            height: `${this.fragment.height * this.tab.zoom}px`,
            transform: `translate(${Math.floor(this.tab.x)}px, ${Math.floor(this.tab.y)}px) rotate(${this.tab.rotate}deg)`
        }
    }

    maxX (zoom = this.tab.zoom)
    {
        return (window.innerWidth + zoom * this.fragment.width) / 2 - OVERFLOW_MARGIN
    }

    minX (zoom = this.tab.zoom)
    {
        return - this.maxX(zoom)
    }

    maxY (zoom = this.tab.zoom)
    {
        return (window.innerHeight + zoom * this.fragment.height) / 2 - OVERFLOW_MARGIN
    }

    minY (zoom = this.tab.zoom)
    {
        return - this.maxY(zoom)
    }

    componentDidMount ()
    {
        // TODO: Remove this. This is just a test / dev stub
        applicationCreateNew(128, 128)
    }

    componentWillUnmount ()
    {
        this.destroyListeners()
    }

    handleRef = el =>
    {
        this.destroyListeners()
        this.el = el
        this.attachListeners()
    }

    destroyListeners ()
    {
        if (!this.el) return
        this.el.removeEventListener('wheel', this.handleWheel)
        this.el.removeEventListener('mousemove', this.handleMouseMove)
    }

    attachListeners ()
    {
        if (!this.el) return
        this.el.addEventListener('wheel', this.handleWheel, { passive: false })
        this.el.addEventListener('mousemove', this.handleMouseMove)
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
        const x = Math.floor((clientX - wrapperRect.left) / this.tab.zoom)
        const y = Math.floor((clientY - wrapperRect.top) / this.tab.zoom)

        this.setCursor(x, y)
    }

    handleWrapperRef = e => this.wrapper = e

    translate (x, y)
    {
        this.setViewport({
            x: this.tab.x + x,
            y: this.tab.y + y,
        })
    }

    setCursor (x, y)
    {
        const down = x > -1 && y > -1 && x < this.fragment.width && y < this.fragment.height
        applicationCursorUpdate(x, y, down)
    }

    zoom (amt, originX, originY)
    {
        amt = amt / window.innerHeight // based on window height

        let zAmt = ZOOM_SPEED * amt

        const zoom = clamp(this.tab.zoom * (1 + zAmt), MIN_ZOOM, MAX_ZOOM)
        zAmt = zoom / this.tab.zoom - 1

        const scaleOriginX = window.innerWidth / 2 + this.tab.x
        const offsetX = (originX - scaleOriginX)
        const oDeltaX = - offsetX * zAmt

        const scaleOriginY = window.innerHeight / 2 + this.tab.y
        const offsetY = (originY - scaleOriginY)
        const oDeltaY = - offsetY * zAmt
        
        this.setViewport({
            zoom,
            x: this.tab.x + oDeltaX,
            y: this.tab.y + oDeltaY
        })
    }

    setViewport ({ zoom = this.tab.zoom, x = this.tab.x, y = this.tab.y, rotation = this.tab.rotation } = {})
    {
        zoom = clamp(zoom, 1, 64)
        x = clamp(x, this.minX(zoom), this.maxX(zoom))
        y = clamp(y, this.minY(zoom), this.maxY(zoom))
        tabActions.save(this.tab.merge({ zoom, x, y, rotation }))
    }

    render ()
    {
        if (this.fragment.null) return null
        return (
            <div className='Workspace' ref={this.handleRef}>
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
        if (!this.props.cursorDown) return null
        let transform = `translate(${this.props.cursorX}px, ${this.props.cursorY}px)`
        return <div className='Workspace-cursor' style={{ transform }}></div>
    }
}