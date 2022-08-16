export const clamp = (v, a, b) =>
{
    const aMin = a < b
    const min = aMin ? a : b
    const max = aMin ? b : a
    return v < min ? min : v > max ? max : v
}