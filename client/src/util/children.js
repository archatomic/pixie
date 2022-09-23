import { Children, Fragment } from 'react'

/** @typedef {import('react').ReactNode} ReactNode */

/**
 * Create a checkable component that does nothing but render its children.
 *
 * Useful for creating declarative component interfaces.
 *
 * @returns {import('react').FC}
 */
export const createPassthroughComponent = () => ({ children }) => <>{children}</>

/**
 * Retrieve an array of children that match the provided type or types.
 *
 * Does deep traversal.
 *
 * @param {ReactNode} children
 * @param {any} type Either a component type or an array of component types.
 * @param {ReactNode[]} [op=[]]
 *
 * @returns {ReactNode[]}
 */
export const getChildrenOfType = (children, type, op = []) =>
{
    const filter = type instanceof Array
        ? (child => type.indexOf(child.type) > -1)
        : (child => type === child.type)
    
    return filterChildren(children, filter, op)
}

/**
 * Retrieve an array of children that do not match the provided type or types.
 *
 * Does deep traversal.
 *
 * @param {ReactNode} children
 * @param {any} type Either a component type or an array of component types.
 * @param {ReactNode[]} [op=[]]
 *
 * @returns {ReactNode[]}
 */
 export const getChildrenNotOfType = (children, type, op = []) =>
 {
     const filter = type instanceof Array
         ? (child => type.indexOf(child.type) === -1)
         : (child => type !== child.type)
     
     return filterChildren(children, filter, op)
 }

/**
 * Traverse children and return a flattened array of child nodes.
 *
 * @param {ReactNode} children
 * @param {ReactNode[]} [op=[]]
 *
 * @returns {ReactNode[]}
 */
export const getChildren = (children, op = []) =>
{
    Children.forEach(children, child => {
        if (child.type === Fragment) getChildren(child?.props?.children, op)
        else return op.push(child)
    })
    return op
}

/**
 * Filter a list of children down and return as an array.
 *
 * @param {ReactNode} children 
 * @param {(ReactNode) => boolean} filter 
 * @param {ReactNode[]} [op=[]]
 *
 * @returns {ReactNode[]}
 */
export const filterChildren = (children, filter, op = []) =>
{
    Children.forEach(children, child => {
        if (!child) return
        if (child.type === Fragment) filterChildren(child.props.children, filter, op)
        else if (filter(child)) return op.push(child)
    })
    return op
}

/**
 * Get the first child that matches a type or an array of types.
 *
 * Does deep traversal.
 *
 * @param {ReactNode} children 
 * @param {any} type Either a component type or an array of component types.
 * 
 * @todo This can be optimized to return as early as possible instead of creating
 *       an entire array in memory and returning the first member.
 *
 * @returns {ReactNode|undefined}
 */
export const getChildOfType = (children, type) => getChildrenOfType(children, type)[0]

/**
 * Get the first child that does not match a type or an array of types.
 *
 * Does deep traversal.
 *
 * @param {ReactNode} children 
 * @param {any} type Either a component type or an array of component types.
 * 
 * @todo This can be optimized to return as early as possible instead of creating
 *       an entire array in memory and returning the first member.
 *
 * @returns {ReactNode|undefined}
 */
 export const getChildNotOfType = (children, type) => getChildrenNotOfType(children, type)[0]