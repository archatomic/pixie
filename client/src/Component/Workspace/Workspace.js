import { MAX_ZOOM, MIN_ZOOM, TOOL, ZOOM_SPEED } from 'Pixie/constants'
import { applicationCursorUpdate, tabActions } from 'Pixie/Store/Action/applicationActions'
import { clamp, int } from 'Pixie/Util/math'

import { Cel } from '../Cel/Cel'
import { Cursor } from 'Pixie/Component/Cursor'
import { Operation } from 'Pixie/Store/Operation'
import { ToolManager } from 'Pixie/Tool/ToolManager'
import { connect } from 'Pixie/Util/connect'
import { def } from 'Pixie/Util/default'
import { Animation } from 'Pixie/Component/Animation'
import { Onion } from 'Pixie/Component/Onion'
import { Component } from 'react'

const OVERFLOW_MARGIN = 20

/**
 * @typedef {object} WorkspaceProps
 * @prop {import('Pixie/Model/ToolBox').Tool} tool
 * @prop {boolean} cursorDown
 * @prop {number} cursorX
 * @prop {number} cursorY
 * @prop {import('Pixie/Model/PixieFragment').PixieFragment} fragment
 * @prop {import('Pixie/Model/Tab').Tab} tab
 */

/**
 * @typedef {object} WorkspaceContainerProps
 * @prop {string|number} [tab]
 */

/**
 * @extends {Component<WorkspaceProps>}
 */
export class Workspace extends Component
{
    static Connected = connect(
        /** @type {import('Pixie/Util/connect').StateToProps<WorkspaceContainerProps, WorkspaceProps>} */
        (state, props) =>
        {
            const tab = state.tabs.find(def(props.tab, state.application.activeTab))
            const fragment = state.fragments.find(tab.fragment)

            const frame = tab.frame
            const cels = fragment.getCels({ frame, visible: true })
            const layers = state.layers.findAll(fragment.layers)

            return {
                tool: state.application.toolbox.active,
                cursorDown: state.application.cursorDown,
                cursorX: state.application.cursorX,
                cursorY: state.application.cursorY,
                tab,
                fragment,
                layers,
                cels

                // tab,
                // fragment,
                // layers: state.layers.findAll(fragment.layers)
            }
        },
        this
    )

    pen = new ToolManager(this.props.tool)
    touch = new ToolManager(TOOL.PAN)

    get tab ()
    {
        return this.props.tab
    }

    get fragment ()
    {
        return this.props.fragment
    }

    get stageStyle ()
    {
        // apply scale
        return {
            width: `${this.fragment.width * this.tab.zoom}px`,
            height: `${this.fragment.height * this.tab.zoom}px`,
            transform: `translate(${int(this.tab.x)}px, ${int(this.tab.y)}px) rotate(${this.tab.rotate}deg)`
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
        Operation.createFragment({ width: 128, height: 128 })
        Operation.pushHistory(this.tab.fragment, 'Open Document')
    }

    componentWillUnmount ()
    {
        this.destroyListeners()
    }

    componentDidUpdate (props)
    {
        if (props.tool !== this.props.tool) {
            this.pen.setTool(this.props.tool)
        }
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
        else if (e.key === 'z' && e.shiftKey && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            return Operation.redoFragment(this.fragment.pk)
        }
        else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            return Operation.undoFragment(this.fragment.pk)
        }
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

        if (this.usePen(e)) {
            // start tool
            // Determine if barrel button is pressed
            const tool = e.button === 2
                ? TOOL.EYEDROPPER
                : e.button === 5
                    ? TOOL.ERASER
                    : this.props.tool
            return this.pen.start(tool, x, y, e)
        }

        if (this.useTouch(e)) {
            // start touch manipulations
            const touchTool = this.touch.active || e.shiftKey ? TOOL.ZOOM : TOOL.PAN
            const bail = this.touch.active && this.touch.toolName === TOOL.ZOOM
            if (bail) return // We're already zoomin', don't re init
            return this.touch.start(touchTool, x, y, e)
        }
    }

    useTouch (e)
    {
        if (e.pointerType === 'touch') return true
        if (e.pointerType !== 'mouse') return false
        if (e.button === 1) return true
        return e.buttons & 4
    }

    usePen (e)
    {
        if (e.pointerType === 'pen') return true
        if (e.pointerType !== 'mouse') return false
        if (e.button === 1) return false
        return !(e.buttons & 4)
    }

    handlePointerMove = (e) =>
    {
        const { x, y } = this.clientToPixel(e)

        if (this.usePen(e)) {
            if (this.pen.active) this.pen.move(x, y, e)
            return this.setCursor(x, y)
        }

        if (this.useTouch(e)) {
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
        if (this.usePen(e)) {
            return this.pen.end(x, y, e)
        }

        if (this.useTouch(e)) {
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
        return (
            <div className='Workspace' ref={this.handleRef}>
                {this.tab.play ? this.renderAnimation() : this.renderEditor()}
            </div>
        )
    }

    renderAnimation ()
    {
        return (
            <div className='Workspace-stage' style={this.stageStyle} ref={this.handleWrapperRef}>
                <div className='Workspace-backdrop' style={{ backgroundSize: `${this.tab.zoom * 3.2}rem` }} />
                <Animation.FromFragment
                    fragment={this.tab.fragment}
                    frame={this.tab.frame}
                    autoplay
                />
            </div>
        )
    }

    renderEditor ()
    {
        return (
            <div className='Workspace-stage' style={this.stageStyle} ref={this.handleWrapperRef}>
                <div className='Workspace-backdrop' style={{ backgroundSize: `${this.tab.zoom * 3.2}rem` }} />
                <Onion.FromFragment className='Workspace-frame' fragment={this.tab.fragment} count={this.tab.onionSkin} position={this.tab.frame} />
                <Cursor.Connected className='Workspace-cursor' data={this.pen.cursor()} scale={this.tab.zoom} />
            </div>
        )
    }

    renderCel ({ cel, layer, frame })
    {
        return (
            <div key={cel} className='Workspace-cel' style={{ transform: `scale(${this.tab.zoom})` }}>
                <Cel.Connected key={cel.pk} cel={cel} />
            </div>
        )
    }
}
