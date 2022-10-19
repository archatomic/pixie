export const clamp = (v, a, b) =>
{
    const aMin = a < b
    const min = aMin ? a : b
    const max = aMin ? b : a
    return v < min ? min : v > max ? max : v
}

export const lerp = (a, b, t) => (a + (b - a) * t)

export const mod = (part, whole) => (whole && ((part % whole) + whole) % whole)

export const int = v => v >> 0

const NUMBER_TYPE = 'number'
export const isNumber = n => (typeof n === NUMBER_TYPE)

export const precision = (num, precision, delim = '.') =>
{
    if (!isNumber(num)) throw new Error('Bad argument provided to precision. Num must be a number')
    const [whole, part] = `${num}`.split(delim)
    if (!part || part.length <= precision) return num
    let op = `${whole}.`
    for (let i = 0; i < precision; i++) {
        op += part[i]
    }
    return parseFloat(op)
}
