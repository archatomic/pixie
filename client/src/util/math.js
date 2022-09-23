export const clamp = (v, a, b) =>
{
    const aMin = a < b
    const min = aMin ? a : b
    const max = aMin ? b : a
    return v < min ? min : v > max ? max : v
}

export const lerp = (a, b, t) => (a + (b - a) * t)

export const mod = (a, b) => ((a % b) + b) % b

export const int = v => v >> 0
