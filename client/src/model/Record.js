import { Record as ImmutableRecord, OrderedMap } from 'immutable'

import { UNDO } from 'client/store/actions/undoActions'
import { nanoid } from 'nanoid'
import { toData } from 'client/util/toData'

/**
 * @typedef {object} BaseRecord
 *
 * @property {string} _id
 * @property {boolean} _isNull
 */

/**
 * @template T
 *
 * @typedef {BaseRecord & T} RecordInstance
 */
 
/**
 * @template T
 *
 * @typedef {function(new:RecordInstance<T>)} RecordClass
 * @property {() => RecordInstance<T>} create
 * @property {RecordInstance<T>} Null
 */
 
/**
 * @template T
 * @param { T } defaults
 * @returns {RecordClass<T>}
 */
export function Record (defaults)
{
    /**
     * @type {Partial<T | BaseRecord>}
     */
    const defaultValues = {
        _id: '',
        _isNull: false
    }

    const key = '_id'

    /**
     * @typedef {object} Initializer
     * @prop {string} prop
     * @prop {any} init
     */
    /** @type {Initializer[]} */
    const initializers = [
        {
            prop: '_id',
            init (props)
            {
                if (props._isNull) return 'null'
                return nanoid()
            }
        }
    ]

    for (const key in defaults) {
        if (defaults[key] instanceof Function) {
            initializers.push({
                prop: key,
                init: defaults[key]
            })
            defaultValues[key] = null
        } else {
            defaultValues[key] = defaults[key]
        }
    }

    return class TypedRecord extends ImmutableRecord(defaultValues) {
        static get Collection ()
        {
            if (!this._collectionKls)
                this._collectionKls = RecordCollection(this, key, this.Null)
            return this._collectionKls
        }

        static get Null ()
        {
            if (!this._nullRecord)
                this._nullRecord = new this({ _isNull: true })
            return this._nullRecord
        }

        static create (props)
        {
            return new this(props)
        }

        /**
         * @param {Partial<typeof defaultValues & typeof defaults> | undefined} props
         */
        constructor(props = {})
        {
            if (props === undefined) props = {}

            for (const { prop, init } of initializers) {
                if (props[prop] !== undefined) continue
                props[prop] = init(props)
            }

            super(props)
        }

        get pk ()
        {
            return this[key]
        }

        get null ()
        {
            return this._isNull
        }

        /**
         * Call a child method
         *
         * @param {string} child Child property
         * @param {string} method Child property method name
         * @param  {...any} args Arguments for the delegate method
         *
         * @returns {any}
         */
        delegate (child, method, ...args)
        {
            return this[child][method](...args)
        }

        /**
         * @method delegateSet()
         * @mutator
         *
         * Call a child mutator and update it in this instance.
         *
         * @param {string} child Child property
         * @param {string} method Child property method name
         * @param  {...any} args Arguments for the delegate method
         *
         * @returns {this}
         */
        delegateSet (child, method, ...args)
        {
            const value = this.delegate(child, method, ...args)
            if (value instanceof this[child].constructor === false) {
                throw new Error(`Tried to call delegateSet on a method that was not a fluent mutator (did not return a mutated instance) ${child}#${method}`)
            }
            return this.set(child, value)
        }

        matches (shape)
        {
            for (const key of Object.keys(shape)) {
                if (this[key] != shape[key]) return false
            }
            return true
        }

        toData ()
        {
            // toData() is capable of calling custom defined toData functions. This
            // small bit of bookkeeping stops us from creating an infinite loop.
            this.__callingToData = true
            try {
                const op = toData(this)
                this.__callingToData = false
                return op
            } catch (e) {
                this.__callingToData = false
                throw e
            }
        }
    }
}

export function RecordCollection(OfType = null, key = '_id', nullItem = null) {
    const pk = (v) => v[key]

    return class RecordCollection extends Record({ items: OrderedMap() }) {
        static createReducer (namespace)
        {
            const prefix = `${namespace}.`
            const INITIAL_STATE = new this()

            return (collection = INITIAL_STATE, action, globalState) =>
            {
                if (action.type === 'undo.restore' && action.payload instanceof OfType) {
                    const stack = globalState.getIn(['application', 'undoManager']).getStack(action.payload)
                    const restored = stack.current
                    if (!restored) return collection.remove(action.payload)
                    return collection.add(restored)
                }

                if (!action.type.startsWith(prefix)) return collection

                const actionType = action.type.substring(prefix.length)
                switch (actionType) {
                    case 'save':
                        return collection.add(action.payload)
                    case 'delete':
                        return collection.remove(action.payload)
                    case 'sort':
                        return collection.sort(action.payload)
                }                

                return collection
            }
        }

        static create ()
        {
            return new this()
        }

        forEach (cb)
        {
            return this.items.forEach(cb)
        }

        filter (criteria)
        {
            return this.items.valueSeq().filter(criteria)
        }

        map (cb)
        {
            return this.items.valueSeq().map(cb)
        }

        toArray ()
        {
            return this.items.valueSeq().toArray()
        }

        sort (cb)
        {
            if (cb instanceof Array) {
                // Sort by id list
                const pks = cb
                cb = (a, b) => pks.indexOf(a.pk) - pks.indexOf(b.pk)
            }

            return this.delegateSet('items', 'sort', cb)
        }

        add (v)
        {
            this.validate(v)
            return this.delegateSet('items', 'set', pk(v), v)
        }

        insert (v, at = -1)
        {
            const newLength = this.length + 1
            if (at < 0 || at >= newLength) at = at % newLength
            if (at < 0) at += newLength

            if (at == newLength - 1) return this.add(v)
            this.validate(v)

            let newItems = OrderedMap()

            // Chunk before
            if (at > 0) this.items.slice(0, at).forEach(
                (v) => { newItems = newItems.set(pk(v), v) }
            )

            // This value
            newItems = newItems.set(pk(v), v)

            // Chunk after
            if (at < newLength) this.items.slice(at).forEach(
                (v) => { newItems = newItems.set(pk(v), v) }
            )

            return this.set('items', newItems)
        }

        getID (any)
        {
            if (any instanceof OfType) return pk(any)
            if (typeof any === 'number') return this.positionToID(any)
            if (this.items.has(any)) return any
            return null
        }

        positionToID (index)
        {
            const member = this.items.valueSeq().get(index)
            if (!member) return null
            return member._id
        }

        remove (v)
        {
            return this.delegateSet('items', 'delete', this.getID(v))
        }

        find (k)
        {
            return this.items.get(this.getID(k), nullItem)
        }

        where (criteria)
        {
            return this.filter((record) => record.matches(criteria))
        }

        get length ()
        {
            return this.items.count()
        }

        validate (record)
        {
            if (!OfType) return // No type checks
            if (record instanceof OfType) return // Type check succeeded
            throw new Error(`Record is incorrect type for this collection`)
        }
    }
}
