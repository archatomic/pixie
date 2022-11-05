import { BinaryData } from 'Pixie/Binary/BinaryData'
import { Dropdown } from 'Pixie/Component/Dropdown'
import { Icon } from 'Pixie/Component/Icon'
import { applicationLayersToggle, applicationThemeToggle } from 'Pixie/Store/Action/applicationActions'
import { replaceState } from 'Pixie/Store/Action/rootActions'
import { Operation } from 'Pixie/Store/Operation'
import { connect } from 'Pixie/Util/connect'
import { readFragment, writeFragment } from 'Pixie/Util/files'
import { go } from 'Pixie/Util/navigate'
import { locate } from 'Pixie/Util/registry'
import { Component } from 'react'

const goHome = () => go('/')

const saveTest = async () => {
    writeFragment(locate('state').fragments.toArray()[0].pk, 'test.px')
}

export class TopBar extends Component
{
    static Connected = connect({
        open: ['application', 'layers'],
        theme: ['application', 'theme']
    }, this)

    handleLoad = () => Operation.load()

    render ()
    {
        return (
            <div className='TopBar'>
                <div className='TopBar-left'>
                    <Icon subtle tight name='bolt' onClick={goHome} />
                </div>
                <div className='TopBar-spacer' />
                <div className='TopBar-right'>
                    <Icon
                        tight
                        subtle
                        name='layer-group'
                        active={this.props.open}
                        onClick={applicationLayersToggle}
                    />
                    <Dropdown>
                        <Dropdown.Item
                            icon='file-circle-plus'
                            onClick={applicationThemeToggle}
                        >
                            New...
                        </Dropdown.Item>
                        <Dropdown.Item
                            icon='file-arrow-up'
                            onClick={this.handleLoad}
                        >
                            Open...
                        </Dropdown.Item>
                        <Dropdown.Item
                            icon='save'
                            onClick={saveTest}
                        >
                            Save
                        </Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item
                            icon={this.props.theme === 'light' ? 'sun' : 'moon'}
                            onClick={applicationThemeToggle}
                        >
                            Change Theme
                        </Dropdown.Item>
                    </Dropdown>
                </div>
            </div>
        )
    }
}
