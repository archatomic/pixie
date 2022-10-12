import { Record as ImmutableRecord, OrderedMap } from 'immutable'

import { locate } from 'client/util/registry'
import { mod } from 'client/util/math'
import { nanoid } from 'nanoid'
import { toData } from 'client/util/toData'

/**
 * There is a problem with this design. The child classes of my record
 * definitions cannot utilize parent record mutators without losing their
 * type and requiring recasting.
 * 
 * e.g.
 * ```js
 * class Foo extends Record({ foo: true }) {
 *      bar() {
 *          return false
 *      }
 * }
 * 
 * Foo.create() // not typed as Foo, rather typed as RecordInstance<{foo: true}>
 * ```
 *
 * @see https://github.com/microsoft/TypeScript/issues/5863
 */

/**
 * @typedef {object} BaseRecordProps
 *
 * @property {string} _id
 * An internal id that tracks permutations of a given record. Most
 * of the time you'll want to use .pk instead.
 *
 * @property {boolean} _isNull
 * Whether or not this is a null record. Set once on creation, and
 * read using the .null accessor. If you're trying to create
 * a null record, try referencing Class.Null instead.
 */

/**
 * @template T
 *
 * @typedef {BaseRecordProps & T} RecordProps
 */

/**
 * @template T
 *
 * @typedef {Partial<RecordProps<T>>} RecordDefinition
 */

/**
 * @template T
 *
 * @typedef {object} RecordMethods
 *
 * @property {boolean} null
 * Whether or not this is a null record.
 *
 * @property {import('./State').State} state
 * Store state convenience getter.
 *
 * @property {string} pk
 * The primary key on this model. This is a normalized lookup and will pass
 * through to whatever the key is on this record.
 *
 * @property {(child: string, method: string, ...args: any[]) => any} delegate
 * Call a child method blindly from it's parent.
 *
 * @property {(child: string, method: string, ...args: any[]) => typeof(this)} delegateSet
 * Call a child mutator and return a mutated instance of this Record.
 *
 * @property {(shape: {[key: string]: any}) => boolean} matches
 * Compare the properties on this record to some dictionary. Returns true if all
 * of the data in the dictionary matches the data in this record.
 *
 * @property {() => any} toData
 * An overrideable serialization method. Returns either a primitive, or an array
 * of primitives, or a dictionary of primitives.
 */

/**
 * @template T
 *
 * @typedef {RecordProps<T> & RecordMethods<T>} RecordInstance
 */

/**
 * @template T
 *
 * @typedef {object} RecordClassMethods
 * @property {RecordCollection<T>} Collection
 * The collection class for this Record.
 *
 * @property {RecordInstance<T>} Null
 * The null record for this Record.
 *
 * @property {([props]: RecordDefinition<T>) => RecordInstance<T>} create
 * Construct an instance without the new keyword. Convenienc method.
 */
 
/**
 * @template T
 *
 * @typedef {(new([props]: RecordDefinition<T>) => RecordInstance<T>) & RecordClassMethods<T>} RecordClass
 */
 
/**
 * @template T
 * @param { T } defaults A record schema.
 * @param { string } [key = 'id'] The primary key of this record. Must be unique.
 * @returns {RecordClass<T>}
 */
export function Record (defaults, key = '_id')
{
    /**
     * @type {RecordDefinition<T>}
     */
    const defaultValues = {
        _id: '',
        _isNull: false
    }

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
         * @type {import('./State').State}
         */
        get state ()
        {
            return locate('store').getState()
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

/**
 * @template T
 * @typedef {object} RecordCollectionClass
 * @property {() => (state: RecordCollectionInstance<T>, action: any, globalState: any) => RecordCollectionInstance<T>} createReducer
 * @property {() => RecordCollectionInstance<T>} create
 */

/**
 * @template T
 * @typedef {object} RecordCollectionInstance
 * @property {() => {}} forEach
 */

/**
 * @template T
 * @typedef {new:() => RecordCollectionInstance<T> & RecordCollectionClass<T>} RecordCollection
 */

/**
 * @template T
 *
 * @param {RecordClass<T>} OfType
 * The record class this collection manages
 * 
 * @param {string} [key = '_id']
 * The primary key. Used to identify when two permutations attach to the same
 * conceptual record.
 *
 * @param {null|RecordInstance<T>} [nullItem = null]
 * The item to use as a return when get operations don't match anything.
 * 
 * @returns {RecordCollection<T>}
 */

export function RecordCollection(OfType = null, key = '_id', nullItem = null) {
    const pk = (v) => v[key]

    return class RecordCollection extends Record({ items: OrderedMap() }) {
        static createReducer (namespace)
        {
            const prefix = `${namespace}.`
            const INITIAL_STATE = new this()

            return (collection = INITIAL_STATE, action, globalState) =>
            {
                if (!action.type.startsWith(prefix)) return collection

                const actionType = action.type.substring(prefix.length)
                switch (actionType) {
                    case 'save':
                        return collection.add(action.payload)
                    case 'delete':
                        if (action.payload instanceof Array) return collection.removeAll(action.payload)
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

        keys ()
        {
            return this.items.keySeq()
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

        addAll (a)
        {
            let op = this
            for (const v of a) {
                op = op.add(v)
            }
            return op
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
            const values = this.items.valueSeq()
            const member = values.get(mod(index, values.count()))
            if (!member) return null
            return member._id
        }

        positionOf (any)
        {
            const id = this.getID(any)
            return this.items.keySeq().indexOf(id)
        }

        remove (v)
        {
            return this.delegateSet('items', 'delete', this.getID(v))
        }

        removeAll (a)
        {
            return this.delegateSet('items', 'deleteAll', a.map(v => this.getID(v)))
        }

        find (k)
        {
            return this.items.get(this.getID(k), nullItem)
        }

        findAll (keys)
        {
            if (keys.toArray) keys = keys.toArray()

            let op = this.constructor.create()
            for (const id of keys) {
                const found = this.find(id)
                if (found.null) continue
                op = op.add(found)
            }
            return op
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

        toData ()
        {
            return this.toArray().map(toData)
        }
    }
}
