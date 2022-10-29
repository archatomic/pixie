export class BinaryWriter
{
    constructor()
    {
        // JS stores strings as UTF16
        /** @type {string} */
        this._data = ''

        /** @type {number} */
        this.bit = -1

        /** @type {number} */
        this.value = 0
    }

    reset ()
    {
        this._data = ''
        this.bit = -1
        this.value = 0
    }

    get data ()
    {
        let op = this._data
        if (this.bit >= 0) op += String.fromCharCode(this.value)
        return op
    }

    writeBit (bit)
    {
        this.bit += 1
        this.value += bit << this.bit
        if (this.bit === 15) this.flush()
    }

    flush ()
    {
        this.bit = -1
        this._data += String.fromCharCode(this.value)
        this.value = 0
    }

    writeInt (int, size)
    {
        if (int >= Math.pow(2, size))
            throw new Error(`Attempted to write ${int} into ${size} bits`)

        for (let i = 0; i < size; i++) {
            this.writeBit((int >> i) & 1)
        }
    }

    writeUTF16 (str, len = str.length)
    {
        if (str.length > len)
            throw new Error(`Attempted to encode UTF16 "${str}" into ${len * 16} bits`)

        for (let i = 0; i < len; i++) {
            const code = i > str.length - 1 ? 0 : str.charCodeAt(i)
            this.writeInt(code, 16)
        }
    }

    writeASCII (str, len = str.length)
    {
        if (str.length > len)
            throw new Error(`Attempted to encode ASCII "${str}" into ${len * 7} bits`)

        for (let i = 0; i < len; i++) {
            const code = i > str.length - 1 ? 0 : str.charCodeAt(i)
            this.writeInt(code, 7)
        }
    }

    writeImage (imageData)
    {
        this.writeInt(imageData.width, 16)
        this.writeInt(imageData.height, 16)
        for (const v of imageData.data) {
            this.writeInt(v, 8)
        }
    }

    writeBool (value)
    {
        this.writeInt(value ? 1 : 0, 1)
    }

    writeFloat (value, len = 10)
    {
        value = `${value}`
        if (value[len - 1] === '.') len--
        if (value.length > len) value = value.substring(0, len)
        this.writeASCII(value, len)
    }
}
