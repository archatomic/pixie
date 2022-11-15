import { ExplorerFile } from 'Pixie/Component/Explorer/ExplorerFile'
import { SPRITES_PATH } from 'Pixie/constants'
import { Operation } from 'Pixie/Store/Operation'
import { deleteFile, readDir } from 'Pixie/Util/files'
import { Component } from 'react'

export class Explorer extends Component
{
    state = {
        loading: true,
        files: []
    }

    async componentDidMount ()
    {
        let files = await readDir({
            path: SPRITES_PATH,
            recursive: true,
            extension: this.props.extension
        })

        if (this.props.recent) {
            files.sort((a, b) => b.file.mtime - a.file.mtime)
        }

        this.setState({
            files: files.slice(0, 9),
            loading: false
        })
    }

    get files ()
    {
        if (this.props.top) return this.state.files.slice(0, this.props.top)
        return this.state.files
    }

    handleFileClick = async (file) => Operation.openFile(file)

    handleFileDelete = async (file) =>
    {
        deleteFile(file.file.name, { path: SPRITES_PATH })
        this.setState({
            files: this.state.files.filter(f => f !== file)
        })
    }

    render ()
    {
        if (this.state.loading) return
        return <div className='Explorer'>
            {this.renderTitle()}
            {this.files.map(file => (
                <ExplorerFile
                    key={file.path}
                    file={file}
                    onClick={this.handleFileClick}
                    onDelete={this.handleFileDelete}
                />
            ))}
        </div>
    }

    renderTitle ()
    {
        const title = this.props.recent ? 'Recent Files' : 'All Files'
        return <h2 className='Explorer-title'>{title}</h2>
    }
}
