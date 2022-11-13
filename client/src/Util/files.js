import { Filesystem, Directory } from '@capacitor/filesystem'
import { BinaryData } from 'Pixie/Binary/BinaryData'

const DELIMITER = '/'

const join = (...args) => {
    return args.filter(f => f).join(DELIMITER)
}

export async function readDir ({
    path = '',
    directory = Directory.Data,
    appendTo = [],
    recursive = false
})
{
    const {files} = await Filesystem.readdir({
        path,
        directory
    })

    const next = []
    for (const child of files) {
        const childPath = join(path, child.name)

        if (child.type === 'directory' && recursive) {
            //recurse
            next.push(
                readDir({
                    path: childPath,
                    directory,
                    appendTo
                })
            )
            continue
        }

        if (child.type === 'file') {
            const segments = child.name.split('.')
            const extension = segments.pop()
            const name = segments.join('.')

            // add
            appendTo.push({
                name,
                extension,
                path: childPath,
                file: child,
                read: async () =>
                {
                    const result = await Filesystem.readFile({
                        path: childPath,
                        directory
                    })
                    return BinaryData.fromBase64(result.data)
                }
            })
            continue
        }
    }

    await Promise.all(next) // Should populate appendTo

    return appendTo
}
