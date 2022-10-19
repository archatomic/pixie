import { Component } from 'react'
import { createPassthroughComponent, getChildrenNotOfType, getChildrenOfType } from 'Pixie/Util/children'

export const Top = createPassthroughComponent()
export const Bottom = createPassthroughComponent()
export const Left = createPassthroughComponent()
export const Right = createPassthroughComponent()

export class UI extends Component
{
    render ()
    {
        const children = getChildrenNotOfType(
            this.props.children,
            [Top, Left, Right, Bottom]
        )

        return (
            <div className='UI'>
                {this.renderSection('UI-top', Top)}
                <div className='UI-center'>
                    {this.renderSection('UI-left', Left)}
                    <div className='UI-spacer'>
                        {children}
                    </div>
                    {this.renderSection('UI-right', Right)}
                </div>
                {this.renderSection('UI-bottom', Bottom)}
            </div>
        )
    }

    renderSection (className, component)
    {
        const children = getChildrenOfType(this.props.children, component)
        if (!children.length) return
        return <div className={className}>{children}</div>
    }
}
