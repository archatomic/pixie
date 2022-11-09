import { schemaRepository } from 'Pixie/Binary/Schema/SchemaRespository'
import { isDefined } from 'Pixie/Util/default'
import { ucFirst } from 'Pixie/Util/string'
import zlib from 'zlibjs'

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

    /**
     * @param {number[]} arr An array of 8 bit numbers
     * @returns {BinaryData}
     */
    static fromArray (arr)
    {
        return this.create(arr)
    }

    /**
     * @param {Uint8Array} uarr
     * @returns {BinaryData}
     */
    static fromUint8Array (uarr)
    {
        return this.fromArray(Array.from(uarr))
    }

    /**
     * @param {ArrayBuffer} abuf
     * @returns {BinaryData}
     */
    static fromBuffer (abuf)
    {
        return this.fromUint8Array(new Uint8Array(abuf))
    }

    /**
     * @param {Uint16Array} uarr
     * @returns {BinaryData}
     */
    static fromUint16Array (uarr)
    {
        return this.fromBuffer(uarr.buffer)
    }

    /**
     * @param {string} str
     * @returns {BinaryData}
     */
    static fromString (str)
    {
        const arr = []
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            arr.push(char & 255)
            arr.push(char >> 8)
        }
        return this.fromArray(arr)
    }

    /**
     * @param {Blob} blob
     * @returns {BinaryData}
     */
    static async fromBlob (blob)
    {
        return this.fromBuffer(await blob.arrayBuffer())
    }

    static create (data = [], bitDepth = 8)
    {
        return new this(data, bitDepth)
    }

    constructor(data = [], bitDepth = 8)
    {
        /** @type {number[]} */
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

        /** @type {number} */
        this._bitDepth = bitDepth

        // WRITE PROPS
        /** @type {number} */
        this._writeBitAddr = -1
    }

    get data ()
    {
        return this._data
    }

    get _maxBitAddress ()
    {
        return this._bitDepth - 1
    }

    get size ()
    {
        let size = this._data.length * this._bitDepth
        if (this._writeBitAddr > -1) size = size - this._bitDepth +  this._writeBitAddr + 1
        return size
    }

    /**
     * @returns {Uint8Array}
     */
    toUint8Array ()
    {
        return new Uint8Array(this.data)
    }

    /**
     * @returns {ArrayBuffer}
     */
    toArrayBuffer ()
    {
        return this.toUint8Array().buffer
    }

    /**
     * @returns {Uint16Array}
     */
    toUint16Array ()
    {
        return new Uint16Array(this.toArrayBuffer())
    }

    /**
     * @returns {string}
     */
    toString ()
    {
        return String.fromCharCode(this.toUint16Array())
    }

    /**
     * @returns {Blob}
     */
    toBlob ()
    {
        return new Blob([this.toArrayBuffer()])
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
        this._data = []
        this._writeBitAddr = -1
        this.resetRead()
    }

    /**
     * Forward the read head by 1 bit
     *
     * Use this instead of manually iterating the head.
     */
    read ()
    {
        this._readBitAddr = (this._readBitAddr + 1) % this._bitDepth

        if (this._readBitAddr === 0) {
            this._readHead++
            if (this._readHead >= this.data.length)
                throw new Error("Attempted to read past the end of the data.")
            this.readChar = this.data[this._readHead]
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

        // Add new word
        if (this._writeBitAddr === 0) this._data.push(0)

        // write to word
        this._data[this._data.length - 1] += bit << this._writeBitAddr

        // reset write head
        if (this._writeBitAddr < this._maxBitAddress) return
        this._writeBitAddr = -1
    }

    canPack (schema)
    {
        return schemaRepository.has(schema)
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

    zip ()
    {
        return zlib.deflateSync(this._data)
    }

    unzip (bytes = this.size / 8)
    {
        const arr = []
        for (let i = 0; i < bytes; i++) {
            arr.push(this.readInt(8))
        }
        const unzippedArray = Array.prototype.slice.call(zlib.inflateSync(arr))
        return new BinaryData(unzippedArray)
    }

    zipPack (schema, value, ...args)
    {
        const data = new BinaryData()
        data.pack(schema, value, args)
        const zipped = data.zip()
        for (const byte of zipped) {
            this.writeInt(byte, 8)
        }
    }

    zipUnpack (bytes, schema, ...args)
    {
        const data = new BinaryData(this.unzip(bytes))
        return data.unpack(schema, ...args)
    }

    toBlob ()
    {
        return new Blob([new Uint8Array(this._data)])
    }
}
