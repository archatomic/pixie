import { Filesystem, Directory } from '@capacitor/filesystem'
import { BinaryData } from 'Pixie/Binary/BinaryData'
import { warn } from 'Pixie/Util/log'
import writeBlob from 'capacitor-blob-writer'

const DELIMITER = '/'
const DEFAULT_DIRECTORY = Directory.Documents

const join = (...args) => {
    return args.filter(f => f).join(DELIMITER)
}

const hasExtension = (path, extension) =>
{
    if (!extension) return true
    if (extension[0] !== '.') extension = `.${extension}`
    return path.substr(-extension.length) === extension
}

export async function readDir ({
    path = '',
    directory = DEFAULT_DIRECTORY,
    appendTo = [],
    recursive = false,
    extension = '',
    suppress = true
} = {})
{
    let files
    try {
        const results = await Filesystem.readdir({
            path,
            directory
        })
        files = results.files
    } catch (e) {
        if (!suppress) throw e
        warn({path, directory}, e)
        return appendTo
    }

    const next = []
    for (const child of files) {
        const childPath = join(path, child.name)

        if (child.type === 'directory' && recursive) {
            //recurse
            next.push(
                readDir({
                    path: childPath,
                    directory,
                    appendTo,
                    recursive,
                    suppress
                })
            )
            continue
        }

        if (child.type === 'file' && hasExtension(child.name, extension)) {
            const segments = child.name.split('.')
            const extension = segments.pop()
            const name = segments.join('.')

            // add
            appendTo.push({
                name,
                extension,
                path: childPath,
                file: child,
                read: () => readFile(child.name, { path, directory })
            })
            continue
        }
    }

    await Promise.all(next) // Populates appendTo

    return appendTo
}

export async function writeFile (
    filename,
    data,
    {
        path = '',
        directory = DEFAULT_DIRECTORY,
        createIntermediateDirectories = true
    } = {})
{
    const blob = data instanceof BinaryData
        ? data.toBlob()
        : data instanceof Blob
        ? data
        : new Blob([data])

    await writeBlob({
        path: join(path, filename),
        directory,
        blob,
        recursive: createIntermediateDirectories
    })
}

export async function readFile (
    filename,
    {
        path = '',
        directory = DEFAULT_DIRECTORY
    }
)
{
    const result = await Filesystem.readFile({
        path: join(path, filename),
        directory
    })

    return BinaryData.fromBase64(result.data)
}

export async function getUniqueFilename (
    filename,
    {
        path = '',
        directory = DEFAULT_DIRECTORY,
        extension = ''
    }
)
{
    filename = filename.replace(/[^A-z\d\s]+/g, '_').replace(/[\s]+/g, ' ')
    const children = await readDir({ path, directory, recursive: false })

    const taken = {}
    for (const child of children) {
        taken[child.file.name] = true
    }

    let unique = `${filename}${extension}`
    let suffix = 1
    while (taken[unique]) {
        suffix++
        unique = `${filename} (${suffix})${extension}`
    }

    return unique
}

export async function deleteFile (
    filename,
    {
        path = '',
        directory = DEFAULT_DIRECTORY,
    }
)
{
    await Filesystem.deleteFile({
        path: join(path, filename),
        directory
    })
}
