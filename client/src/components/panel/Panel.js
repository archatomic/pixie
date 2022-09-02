import classNames from 'classnames'
import { forwardRef } from 'react'

/**
 * @typedef {object} PanelProps
 * @property {boolean} [full]
 */

/**
 * @type {import('react').ForwardRefExoticComponent<PanelProps>}
 */
export const Panel = forwardRef(({ className, full, ...props }, ref) => (
    <div className={classNames('Panel', className, { 'Panel--full': full})} ref={ref} {...props} />
))