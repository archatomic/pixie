import { useEffect } from 'react'

/**
 * @extends {Component<{do: () => void}>}
 */
export const Action = ({ do: cb }) => {
    useEffect(cb)
    return null
}
