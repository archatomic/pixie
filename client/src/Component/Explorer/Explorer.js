import { Operation } from 'Pixie/Store/Operation'
import { readDir } from 'Pixie/Util/files'
import { Component } from 'react'

export class Explorer extends Component
{
    state = {
        loading: true,
        files: []
    }

    async componentDidMount ()
    {
        const files = await readDir({ recursive: true })

        this.setState({
            files,
            loading: false
        })
    }

    handleFile = async (e) =>
    {
        const i = e.currentTarget.dataset.file
        const file = this.state.files[i]
        const content = await file.read()
        switch (file.extension) {
            case 'px':
                Operation.loadPixie(file.name, content)
        }
    }

    render ()
    {
        if (this.state.loading) return
        return <div className='Explorer'>
            {this.state.files.map(this.renderFile)}
        </div>
    }

    renderFile = (file, i) =>
    {
        return (
            <div className='Explorer-file' key={file.path} data-file={i} onClick={this.handleFile}>
                {file.file.name}
            </div>
        )
    }
}
