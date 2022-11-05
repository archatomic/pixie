import { createNode } from 'Pixie/Util/createNode'

export const load = ({
    extensions = [],
    msToCancel = 1000
}) =>
{
    const input = createNode({
        tag: 'input',
        attrs: {
            type: 'file',
            accept: extensions.join(',')
        }
    })
    input.click()

    return new Promise((resolve) =>
    {
        let timeout = null

        const onWindowFocus = () =>
        {
            timeout = setTimeout(
                () => resolve(null),
                msToCancel
            )
        }

        const onFileInput = () =>
        {
            clearTimeout(timeout)
            resolve(input.files[0])
        }

        window.addEventListener('focus', onWindowFocus, { once: true })
        input.addEventListener('input', onFileInput, { once: true })
    })
}
