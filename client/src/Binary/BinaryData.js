import { schemaRepository } from 'Pixie/Binary/Schema/SchemaRespository'
import { ucFirst } from 'Pixie/Util/string'

const BIT_DEPTH = 16
const MAX_BIT_ADDR = BIT_DEPTH - 1

export class BinaryData
{
    static addSchemaToPrototype (name)
    {
        const readMethod = `read${ucFirst(name)}`
        if (!BinaryData.prototype[readMethod])
            BinaryData.prototype[readMethod] = function readSchema (...args)
            {
                return this.unpack(name, ...args)
            }

        const writeMethod = `write${ucFirst(name)}`
        if (!BinaryData.prototype[writeMethod])
            BinaryData.prototype[writeMethod] = function writeSchema (
                value,
                ...args
            )
            {
                return this.pack(name, value, ...args)
            }
    }

    constructor(data = '')
    {
        /** @type {string} */
        this._data = data

        // READ PROPS
        /** @type {number} */
        this._readHead = -1

        /** @type {number} */
        this._readBitAddr = -1

        /** @type {number} */
        this._readWord = 0

        /** @type {number} */
        this._readBit = 0

        // WRITE PROPS
        /** @type {number} */
        this._writeBitAddr = -1

        /** @type {number} */
        this._writeWord = 0
    }

    get data ()
    {
        let op = this._data
        if (this._writeBitAddr > -1) op += String.fromCharCode(this._writeWord)
        return op
    }

    /**
     * Start the read from the beginning
     */
    resetRead ()
    {
        this._readHead = -1
        this._readBitAddr = -1
        this._readWord = 0
        this._readBit = 0
    }

    /**
     * Start the write from the beginning
     */
    reset ()
    {
        this._data = ''
        this._writeBitAddr = -1
        this._writeWord = 0
        this.resetRead()
    }

    /**
     * Forward the read head by 1 bit
     *
     * Use this instead of manually iterating the head.
     */
    read ()
    {
        this._readBitAddr = (this._readBitAddr + 1) % BIT_DEPTH

        if (this._readBitAddr === 0) {
            this._readHead++
            if (this._readHead >= this.data.length)
                throw new Error("Attempted to read past the end of the data.")
            this.readChar = this.data.charCodeAt(this._readHead)
        }

        this._readBit = (this.readChar >> this._readBitAddr) & 1

        return this._readBit
    }


    /**
     * Forward the write head by 1 bit
     */
    write (bit)
    {
        this._writeBitAddr += 1
        this._writeWord += bit << this._writeBitAddr
        if (this._writeBitAddr < MAX_BIT_ADDR) return
        this._writeBitAddr = -1
        this._data += String.fromCharCode(this._writeWord)
        this._writeWord = 0
    }

    pack (schema, value, ...args)
    {
        const schemaInstance = schemaRepository.get(schema)
        return schemaInstance.write(this, value, ...args)
    }

    unpack (schema, ...args)
    {
        const schemaInstance = schemaRepository.get(schema)
        return schemaInstance.read(this, ...args)
    }
}
