import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { packFragments, unpack } from 'Pixie/Binary/packFragments'

export const writeFile = (path, data) => Filesystem.writeFile({
    path,
    data,
    directory: Directory.Documents,
    encoding: Encoding.UTF8
})

export const readFile = (path) => Filesystem.readFile({
    path,
    directory: Directory.Documents,
    encoding: Encoding.UTF8
})

export const writeFragment = async (id, path) =>
{
    const data = packFragments(id)
    return writeFile(path, data)
}

export const readFragment = async (path) =>
{
    const result = await readFile(path)
    return unpack(result.data)
}
