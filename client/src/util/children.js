import { Children, Fragment } from 'react'

export const createPassthroughComponent = () => ({children}) => <>{children}</>
export const getChildrenOfType = (children, type, op = []) => {
    Children.forEach(children, child => {
        if (child.type === type) return op.push(child)
        if (child.type === Fragment) getChildrenOfType(child.props.children, type, op)
    })
    return op
}

export const getChildOfType = (children, type) => getChildrenOfType(children, type)[0]