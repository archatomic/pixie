
/**
 * Quick element creation utility.
 *
 * @param {object} options
 * @param {string} [options.tag = 'div']
 * @param {object} [options.attrs = {}]
 * @param {HTMLElement|null} [options.parent = null]
 *
 * @returns {HTMLElement}
 */
export function createNode ({
    parent,
    tag = 'div',
    attrs = {}
} = {})
{
    const el = document.createElement(tag)

    for (const key of Object.keys(attrs)) {
        el.setAttribute(key, attrs[key])
    }

    if (parent) parent.appendChild(el)

    return el
}
