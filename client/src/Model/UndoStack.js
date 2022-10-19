import { List, Map } from 'immutable'

import { Record } from './Record'
import { isDefined } from 'Pixie/Util/default'

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
        const head = Math.min(this.head + steps, this.firstItemIndex)
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

    sanitize ()
    {
        return this.nodes.map(n => n.description)
    }

    get firstItemIndex ()
    {
        return this.nodes.count() - 1
    }

    // debug ()
    // {
    //     console.log(this.nodes.toArray().map(node => node.description))
    //     return this
    // }

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

    get canUndo ()
    {
        return this.head < this.firstItemIndex
    }

    get canRedo ()
    {
        return this.head > 0
    }
}

export class UndoManager extends Record({
    stacks: Map()
}) {
    getStackKey (record)
    {
        if (typeof record === 'string') return record

        if (!isDefined(record) || !record) return UndoStack.Null

        if (record.undoKey instanceof Function) return record.undoKey()
        if (typeof record.undoKey === 'string') return record.undoKey
        return `${record.constructor.name}:${record.pk}`
    }

    sanitize ()
    {
        let op = {}
        for (const key of this.stacks.keySeq()) {
            op[key] = this.stacks.get(key).sanitize()
        }
        return op

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
        const key = this.getStackKey(record)
        if (this.hasStack(record)) return this.stacks.get(key)
        return UndoStack.create({ _id: key })
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
