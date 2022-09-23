import './Workspace.styl'

import { MAX_ZOOM, MIN_ZOOM, TOOL_ERASER, TOOL_EYEDROPPER, TOOL_PAN, TOOL_ZOOM, ZOOM_SPEED } from 'client/constants'
import { applicationCreateNew, applicationCursorUpdate, applicationSwapColors, tabActions } from 'client/store/actions/applicationActions'
import { redo, undo } from 'client/store/actions/undoActions'

import { Cel } from '../cel/Cel'
import { Component } from 'react'
import { ToolManager } from 'client/tools/ToolManager'
import { clamp } from 'client/util/math'
import { connect } from 'client/util/connect'

const OVERFLOW_MARGIN = 20

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

    pen = new ToolManager()
    touch = new ToolManager()

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
            const renderToolCel = layer === activeLayer && this.tab.toolCel
            const skipCel = cel.null || (this.tab.hideActive && layer === activeLayer)
            const renderCel = !skipCel
        
            if (renderCel) cels.push(cel)
            if (renderToolCel) cels.push(this.tab.toolCel)
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

    get targetHeight ()
    {
        if (!this.el) return window.innerHeight
        return this.el.getBoundingClientRect().height
    }

    get targetWidth ()
    {
        if (!this.el) return window.innerHeight
        return this.el.getBoundingClientRect().width
    }

    maxX (zoom = this.tab.zoom)
    {
        return (this.targetWidth + zoom * this.fragment.width) / 2 - OVERFLOW_MARGIN
    }

    minX (zoom = this.tab.zoom)
    {
        return - this.maxX(zoom)
    }

    maxY (zoom = this.tab.zoom)
    {
        return (this.targetHeight + zoom * this.fragment.height) / 2 - OVERFLOW_MARGIN
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
        window.removeEventListener('keydown', this.handleKeyDown)
        this.el.removeEventListener('wheel', this.handleWheel)
        this.el.removeEventListener('wheel', this.handleWheel)
        this.el.removeEventListener('pointerdown', this.handlePointerDown)
        this.el.removeEventListener('pointermove', this.handlePointerMove)
        this.el.removeEventListener('pointerleave', this.handlePointerLeave)
        this.el.removeEventListener('pointerup', this.handlePointerUp)
        this.el.removeEventListener('pointercancel', this.handlePointerCancel)
    }

    attachListeners ()
    {
        if (!this.el) return
        window.addEventListener('keydown', this.handleKeyDown)
        this.el.addEventListener('wheel', this.handleWheel, { passive: false })
        this.el.addEventListener('pointerdown', this.handlePointerDown)
        this.el.addEventListener('pointermove', this.handlePointerMove)
        this.el.addEventListener('pointerleave', this.handlePointerLeave)
        this.el.addEventListener('pointerup', this.handlePointerUp)
        this.el.addEventListener('pointercancel', this.handlePointerCancel)
    }

    handleKeyDown = (e) =>
    {
        if (e.key === 'Escape') return this.handlePointerCancel(e)
        else if (e.key === 'x') return applicationSwapColors()
        else if (e.key === 'z' && e.shiftKey && (e.ctrlKey || e.metaKey)) return redo(this.fragment)
        else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) return undo(this.fragment)
    }

    handleWheel = (e) =>
    {
        e.stopPropagation()
        e.preventDefault()

        if (!e.ctrlKey) this.translate(-e.deltaX, -e.deltaY)
        else this.zoom(-e.deltaY, e.clientX, e.clientY)
        this.handleMouseMove(e)
    }

    handlePointerCancel = (e) =>
    {
        this.touch.cancel()
        this.pen.cancel()
    }

    /**
     * @param {PointerEvent} e 
     */
    handlePointerDown = (e) =>
    {
        e.target.setPointerCapture(e.pointerId)
        const { x, y } = this.clientToPixel(e)

        switch (e.pointerType) {
            case 'mouse':
            case 'pen':
                // start tool
                // Determine if barrel button is pressed
                const tool = e.button === 2
                    ? TOOL_EYEDROPPER
                    : e.button === 5
                    ? TOOL_ERASER
                    : this.props.tool
                return this.pen.start(tool, x, y, e)
            case 'touch':
                // start touch manipulations
                const touchTool = this.touch.active ? TOOL_ZOOM : TOOL_PAN
                const bail = this.touch.active && this.touch.toolName === TOOL_ZOOM
                if (bail) return // We're already zoomin', don't re init
                return this.touch.start(touchTool, x, y, e)
        }
    }

    handlePointerMove = (e) =>
    {
        const { x, y } = this.clientToPixel(e)
        switch (e.pointerType) {
            case 'mouse':
            case 'pen':
                if (this.pen.active) this.pen.move(x, y, e)
                return this.setCursor(x, y)
            case 'touch':
                return this.touch.move(x, y, e)
        }
    }

    handlePointerLeave = (e) =>
    {
        const { x, y } = this.clientToPixel(e)
        this.setCursor(x, y, false)
    }

    handlePointerUp = (e) =>
    {
        const { x, y } = this.clientToPixel(e)
        switch (e.pointerType) {
            case 'mouse':
            case 'pen':
                return this.pen.end(x, y, e)
            case 'touch':
                return this.touch.end(x, y, e)
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

    handleWrapperRef = e => this.wrapper = e

    translate (x, y)
    {
        this.setViewport({
            x: this.tab.x + x,
            y: this.tab.y + y,
        })
    }

    setCursor (x, y, d = null)
    {
        const down = d == null
            ? x > -1 && y > -1 && x < this.fragment.width && y < this.fragment.height && !this.pen.active
            : d
        applicationCursorUpdate(x, y, down)
    }

    zoom (amt, originX, originY)
    {
        amt = amt / this.targetHeight // based on window height

        let zAmt = ZOOM_SPEED * amt

        const zoom = clamp(this.tab.zoom * (1 + zAmt), MIN_ZOOM, MAX_ZOOM)
        zAmt = zoom / this.tab.zoom - 1

        const scaleOriginX = this.targetWidth / 2 + this.tab.x
        const offsetX = (originX - scaleOriginX)
        const oDeltaX = - offsetX * zAmt

        const scaleOriginY = this.targetHeight / 2 + this.tab.y
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
        const style = { transform } // Todo... support cursor specific styles
        return <div className='Workspace-cursor' style={style}></div>
    }
}