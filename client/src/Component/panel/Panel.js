import classNames from 'classnames'
import { forwardRef } from 'react'

/**
 * @typedef {object} PanelProps
 * @property {boolean} [full]
 * @property {boolean} [tight]
 * @property {boolean} [round]
 */

/**
 * @type {import('react').ForwardRefExoticComponent<PanelProps>}
 */
export const Panel = forwardRef(({ className, full, tight, round, ...props }, ref) => (
    <div
        className={classNames(
            'Panel',
            className,
            {
                'Panel--full': full,
                'Panel--tight': tight,
                'Panel--round': round
            })}
        ref={ref}
        {...props}
    />
))