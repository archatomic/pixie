import './Workspace.styl'

import { TOOL_ERASER, TOOL_EYEDROPPER } from 'client/constants'
import { applicationCreateNew, applicationCursorUpdate, tabActions } from 'client/store/actions/applicationActions'

import { Cel } from '../cel/Cel'
import { Component } from 'react'
import { ToolManager } from 'client/tools/ToolManager'
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
            'tool': ['application', 'tool'],
            'cursorDown': ['application', 'cursorDown'],
            'cursorX': ['application', 'cursorX'],
            'cursorY': ['application', 'cursorY'],
            'tab': (state) => state.get('application').getActiveTab(),
            'fragment': (state) => state.get('application').getActiveFragment(),
        },
        this
    )

    toolManager = new ToolManager()

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
        const cels = []
        const frameCels = this.fragment
            .getFrameCels(this.tab.frame)
            .toArray()
        
        const activeLayer = this.fragment.getLayer(this.tab.layer).pk

        // TODO: Respect "inherited"
        for (const { layer, cel } of frameCels) {
            if (layer === activeLayer && this.tab.toolCel) cels.push(this.tab.toolCel)
           
            if (cel.null) continue
            if (layer === activeLayer && this.tab.hideActive) continue
            
            cels.push(cel)
        }

        return cels
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
        this.el.removeEventListener('pointerdown', this.handlePointerDown)
        this.el.removeEventListener('pointermove', this.handlePointerMove)
        this.el.removeEventListener('pointerup', this.handlePointerUp)
    }

    attachListeners ()
    {
        if (!this.el) return
        this.el.addEventListener('wheel', this.handleWheel, { passive: false })
        this.el.addEventListener('pointerdown', this.handlePointerDown)
        this.el.addEventListener('pointermove', this.handlePointerMove)
        this.el.addEventListener('pointerup', this.handlePointerUp)
    }

    handleWheel = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()

        if (!e.ctrlKey) this.translate(-e.deltaX, -e.deltaY)
        else this.zoom(-e.deltaY, e.clientX, e.clientY)
        this.handleMouseMove(e)
    }

    /**
     * @param {PointerEvent} e 
     */
    handlePointerDown = (e) =>
    {
        e.target.setPointerCapture(e.pointerId)
        switch (e.pointerType) {
            case 'mouse':
            case 'pen':
                const { x, y } = this.clientToPixel(e)
                // start tool
                // Determine if barrel button is pressed
                const tool = e.button === 2
                    ? TOOL_EYEDROPPER
                    : e.button === 5
                    ? TOOL_ERASER
                    : this.props.tool
                return this.toolManager.start(tool, x, y)
            case 'touch':
                // start touch manipulations
                return console.log("touch start")
        }
    }

    handlePointerMove = (e) =>
    {
        const { x, y } = this.clientToPixel(e)
        switch (e.pointerType) {
            case 'mouse':
                if (this.toolManager.active) return this.toolManager.move(x, y)
                else return this.setCursor(x, y)
            case 'pen':
                return this.toolManager.move(x, y)
            case 'touch':
                return console.log("touch move")
        }
    }

    handlePointerUp = (e) =>
    {
        switch (e.pointerType) {
            case 'mouse':
            case 'pen':
                this.toolManager.end()
                return
            case 'touch':
                // end touch manipulations
                return
        }
    }

    handleMouseMove = (e) =>
    {
        if (!this.wrapper) return
        const { x, y } = this.clientToPixel(e)
        this.setCursor(x, y)
    }

    clientToPixel ({ clientX, clientY })
    {
        const wrapperRect = this.wrapper.getBoundingClientRect()
        return {
            x: Math.floor((clientX - wrapperRect.left) / this.tab.zoom),
            y: Math.floor((clientY - wrapperRect.top) / this.tab.zoom),
        }
    }

    handleTouchStart = (e) =>
    {
        
    }

    handleTouchMove = (e) =>
    {
        //console.log('move', e.touches)
    }

    handleTouchEnd = (e) =>
    {
        //console.log('end', e.touches)
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