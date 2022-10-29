export class BinaryReader
{
    constructor(data)
    {
        // JS stores strings as UTF16
        /** @type {string} */
        this.data = data

        /** @type {number} */
        this.head = -1

        /** @type {number} */
        this.bit = -1

        /** @type {number} */
        this.end = this.data.length - 1

        /** @type {string} */
        this.char = ''

        /** @type {number} */
        this.value = 0
    }

    reset ()
    {
        this.head = -1
        this.bit = -1
        this.end = this.data.length - 1
        this.char = ''
        this.value = 0
    }

    /**
     * Forward the read head by 1
     *
     * Use this instead of manually iterating the head.
     *
     * @returns {number}
     */
    forward ()
    {
        this.bit = (this.bit + 1) % 16

        if (this.bit === 0) {
            this.head++
            this.char = this.data[this.head]
        }

        if (this.head > this.end)
            throw new Error("Attempted to read past the end of the data.")

        this.value = this.char.charCodeAt(0) >> this.bit & 1
    }

    /**
     * Get next bit as a 0 / 1 numerical value
     *
     * @returns {number}
     */
    readBit ()
    {
        this.forward()
        return this.value
    }

    /**
     * Read the next bytes as an integer
     *
     * @param {number} [bits] Number of bits to read
     *
     * @returns {number}
     */
    readInt (bits = 1)
    {
        let op = 0

        for (let i = 0; i < bits; i++) {
            op += this.readBit() << i
        }

        return op
    }

    /**
     * Read the next section as a utf16 string
     *
     * @param {number} [length] Number of characters to read
     *
     * @returns {string}
     */
    readUTF16 (length = 1)
    {
        let op = ''
        for (let i = 0; i < length; i++) {
            // Each utf16 charCode is a 16 bit number
            const charCode = this.readInt(16)
            if (charCode === 0) continue // Skip null bytes
            op += String.fromCharCode(charCode)
        }
        return op
    }

    /**
     * Read the next section as an ASCII string
     *
     * @param {number} [length] Number of characters to read
     *
     * @returns {string}
     */
    readASCII (length = 1)
    {
        let op = ''
        for (let i = 0; i < length; i++) {
            // Each ASCII charCode is a 7 bit number
            const charCode = this.readInt(7)
            if (charCode === 0) continue // Skip null bytes
            // UTF16 0 - 127 map to ASCII 0 - 127
            op += String.fromCharCode(charCode)
        }
        return op
    }

    /**
     * Read the next bit as a bool
     *
     * @returns {boolean}
     */
    readBool ()
    {
        return this.readBit() === 1
    }

    readImage ()
    {
        const width = this.readInt(16)
        const height = this.readInt(16)

        const imageData = new ImageData(width, height)
        for (let i = 0; i < width * height * 4; i++)
            imageData.data[i] = this.readInt(8)

        return imageData
    }

    /**
     * Read the next section as a float
     *
     * @returns {number}
     */
    readFloat (len)
    {
        return parseFloat(this.readASCII(len))
    }
}
