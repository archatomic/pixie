import { Dropdown } from 'Pixie/Component/Dropdown'
import { Image } from 'Pixie/Component/Image'
import { safeCall } from 'Pixie/Util/safeCall'
import { Component } from 'react'

/**
 *
 * @param {ImageData} source
 * @param {ImageData} destination
 * @param {number} [x]
 * @param {number} [y]
 * @param {number} [width]
 * @param {number} [height]
 */
const copyInto = (
    source,
    destination,
    offsetX = 0,
    offsetY = 0,
    width = source.width,
    height = destination.height
) =>
{
    width = Math.min(width, source.width, destination.width - offsetX)
    height = Math.min(height, source.height, destination.height - offsetY)
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const destX = x + offsetX
            const destY = y + offsetY
            let i = (x + y * source.width) * 4
            let destI = (destX + destY * destination.width) * 4
            destination.data[destI    ] = source.data[i    ]
            destination.data[destI + 1] = source.data[i + 1]
            destination.data[destI + 2] = source.data[i + 2]
            destination.data[destI + 3] = source.data[i + 3]
        }
    }
}

/**
 * @typedef {object} ExplorerFileProps
 * @property {object} file
 */

/**
 * @extends {Component<ExplorerFileProps>}
 */
export class ExplorerFile extends Component
{
    state = {
        preview: null
    }

    handleClick = () => safeCall(
        this.props.onClick,
        this.props.file
    )

    handleDelete = () => safeCall(
        this.props.onDelete,
        this.props.file
    )

    async componentDidMount ()
    {
        const contents = await this.props.file.read()
        const pixie = contents.unpack('Pixie')

        const fragment = pixie.fragments[0]
        const frame = pixie.frames[0]
        const layers = pixie.layers.filter(l => l.fragment === fragment.id && l.visible).map(l => l.id)
        const cels = fragment.cels.filter(([frameID, layerID]) => (
            frameID === frame.id && layers.indexOf(layerID) > -1
        )).map(([_, __, c]) => c)

        const idata = new ImageData(fragment.width, fragment.height)
        for (const cel of pixie.cels) {
            if (cels.indexOf(cel.id) === -1) continue
            // copy in cel data
            copyInto(cel.data, idata, cel.x, cel.y)
        }

        this.setState({ preview: idata })
    }

    render ()
    {
        return (
            <div
                className='Explorer-file'
                onClick={this.handleClick}
            >
                {this.renderPreview()}
                {this.renderFilename()}
                {this.renderMetadata()}
            </div>
        )
    }

    renderPreview ()
    {
        return (
            <div className='Explorer-preview'>
                {this.renderMenu()}
                {this.state.preview && (
                    <Image
                        className='Explorer-image'
                        checker
                        data={this.state.preview}
                    />
                )}
            </div>
        )
    }

    renderMenu ()
    {
        if (!this.props.onDelete) return null
        return (
            <Dropdown
                className='Explorer-menu'
                tight
                popoverProps={{
                    align: 'right',
                    vAlign: 'top'
                }}
            >
                <Dropdown.Item
                    icon='trash'
                    onClick={this.handleDelete}
                >
                    Delete
                </Dropdown.Item>
        </Dropdown>
        )
    }

    renderFilename ()
    {
        return (
            <div className='Explorer-filename'>
                {this.props.file.name}
            </div>
        )
    }

    renderMetadata ()
    {
        const date = new Date(this.props.file.file.mtime)
        return (
            <div className='Explorer-metadata'>
                {date.toDateString()}
            </div>
        )
    }
}
