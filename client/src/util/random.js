export function randomString (len = 32)
{
    const arr = randomIntArray(Math.ceil(len / 2))
    window.crypto.getRandomValues(arr)
    const op = Array.from(arr, num => num.toString(16).padStart(2, '0')).join('')
    if (op.length > len) return op.substring(0, len)
    return op
}

const randomIntArray = window.crypto
    ? len =>
    {
        const arr = new Uint8Array(len)
        window.crypto.getRandomValues(arr)
        return arr
    }
    : len =>
    {
        const arr = new Uint8Array(len)
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256)
        }
        return arr
    }
