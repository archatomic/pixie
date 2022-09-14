import { List, Map } from 'immutable'

import { Record } from './Record'
import { isDefined } from 'client/util/default'

const MAX_UNDO_STACK_SIZE = 100

/**
 * @template T
 *
 * @typedef {object} UndoNode
 * @property {T} record The undo node record
 * @property {string} description The actual state
 */

export class UndoStack extends Record({
    /** @type {List<UndoNode<T>>} */
    nodes: List(),
    /** @type {number} */
    head: -1,
    /** @type {number} */
    maxStackSize: MAX_UNDO_STACK_SIZE
}) {
    /**
     * Push a record into the undo stack.
     * 
     * @param {any} record 
     * @param {string} description 
     * @returns {UndoStack}
     */
    push (record, description = 'Updated')
    {
        let nodes = this.nodes

        if (this.head > 0) nodes = nodes.slice(this.head)
        nodes = nodes.unshift({ record, description })
        while (nodes.count() > this.maxStackSize) nodes = nodes.pop()
        
        return this.merge({
            nodes,
            head: 0
        })
    }

    /**
     * Move head back by the number of steps
     * 
     * @param {number} [steps=1]
     * @returns {UndoStack}
     */
    undo (steps = 1)
    {
        if (this.nodes.count() === 0) return this
        const head = Math.min(this.head + steps, this.nodes.count() - 1)
        if (head === this.head) return this
        return this.set('head', head)
    }

    /**
     * Move head forward by the number of steps
     *
     * @param {number} [steps=1]
     * @returns {UndoStack}
     */
    redo (steps = 1)
    {
        if (this.nodes.count() === 0) return this
        const head = Math.max(this.head - steps, 0)
        if (head === this.head) return this
        return this.set('head', head)
    }

    get currentNode ()
    {
        return this.nodes.get(this.head)
    }

    get current ()
    {
        return this.currentNode?.record
    }

    get description ()
    {
        return this.currentNode?.description
    }
}

export class UndoManager extends Record({
    stacks: Map()
}) {
    getStackKey (record)
    {
        if (!isDefined(record) || !record) return

        if (record.undoKey instanceof Function) return record.undoKey()
        if (typeof record.undoKey === 'string') return record.undoKey
        return record.pk
    }

    getStackKeyStrict (record)
    {
        const key = this.getStackKey(record)
        if (!key) throw new Error("Could not determine suitable undo key for instance")
        return key
    }

    hasStack (record)
    {
        return this.stacks.has(this.getStackKeyStrict(record))
    }

    getStack (record)
    {
        if (this.hasStack(record)) return this.stacks.get(this.getStackKey(record))
        return UndoStack.create({ _id: record.pk })
    }

    push (record, description)
    {
        const stack = this.getStack(record).push(record, description)
        return this.setIn(['stacks', stack.pk], stack)
    }

    undo (record, steps = 1)
    {
        const stack = this.getStack(record).undo(steps)
        return this.setIn(['stacks', stack.pk], stack)
    }

    redo (record, steps = 1)
    {
        const stack = this.getStack(record).redo(steps)
        return this.setIn(['stacks', stack.pk], stack)
    }
}
