import { IS_MOBILE } from 'Pixie/constants'
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

export const save = (opts) =>
{
    if (IS_MOBILE) return saveMobile(opts)
    return saveWeb(opts)
}

const saveMobile = ({ filename, data }) =>
{

}

const saveWeb = ({ filename, data }) =>
{
    const blob = data.toBlob()
    const url = URL.createObjectURL(blob)

    const downloadLink = createNode({
        tag: 'a',
        attrs: {
            href: url,
            download: filename
        },
        parent: document.body
    })
    downloadLink.click()
    document.body.removeChild(downloadLink)

    URL.revokeObjectURL(url)
}
