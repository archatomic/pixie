import { MAX_ZOOM, MIN_ZOOM } from 'Pixie/constants'

import { BaseTool } from './BaseTool'
import { clamp } from 'Pixie/Util/math'
import { locate } from 'Pixie/Util/registry'
import { tabActions } from 'Pixie/Store/Action/applicationActions'

/**
 * @typedef {import('./ToolManager').ToolData} ToolData
 * @typedef {import('Pixie/Model/Application').Application} Application
 */

export class Zoom extends BaseTool
{
    start (_, event, old)
    {
        /** @type {import('Pixie/Model/Application').Application} */
        const application = locate('state').application
        this.initialTab = application.getActiveTab()
        this.tab = this.initialTab

        this.aID = old.event?.pointerId
        this.aX = (old.event || event).clientX
        this.aY = (old.event || event).clientY

        this.bID = event.pointerId
        this.bX = event.clientX
        this.bY = event.clientY

        this.startSize = this.distance(this.aX, this.aY, this.bX, this.bY)

        this.startX = (this.aX + this.bX) / 2
        this.startY = (this.aY + this.bY) / 2

        this.x = this.startX
        this.y = this.startY
        this.size = this.startSize
    }

    distance (x1, y1, x2, y2)
    {
        const dX = x2 - x1
        const dY = y2 - y1
        return Math.sqrt(dX * dX + dY * dY)
    }

    move (_, { clientX, clientY, pointerId })
    {
        let update = false

        if (pointerId === this.aID) {
            this.aX = clientX
            this.aY = clientY
            update = true
        }

        if (pointerId === this.bID) {
            this.bX = clientX
            this.bY = clientY
            update = true
        }

        if (!update) return

        this.x = (this.aX + this.bX) / 2
        this.y = (this.aY + this.bY) / 2
        this.size = this.distance(this.aX, this.aY, this.bX, this.bY)

        const zoom = this.getZoom()
        const dX = this.x - this.startX
        const dY = this.y - this.startY

        this.tab = this.initialTab.merge({
            zoom: clamp(this.initialTab.zoom * zoom, MIN_ZOOM, MAX_ZOOM),
            x: this.initialTab.x + dX,
            y: this.initialTab.y + dY
        })

        this.persist()
    }

    getZoom ()
    {
        if (!this.startSize || !this.aID) return this.getOnePointZoom()
        return this.getTwoPointZoom()
    }

    getOnePointZoom ()
    {
        const h = window.innerHeight / 2
        const value = this.aY - this.bY
        return (value + h) / h
    }

    getTwoPointZoom ()
    {
        return this.size / this.startSize
    }

    end (data, e)
    {
        this.move(data, e)
    }

    cancel ()
    {
        this.tab = this.initialTab
        this.persist()
    }

    persist ()
    {
        tabActions.save(this.tab)
    }
}
