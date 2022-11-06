import classNames from 'classnames'
import { Dropdown } from 'Pixie/Component/Dropdown'
import { Icon } from 'Pixie/Component/Icon'
import { applicationLayersToggle, applicationTabFocus, applicationThemeToggle } from 'Pixie/Store/Action/applicationActions'
import { Operation } from 'Pixie/Store/Operation'
import { connect } from 'Pixie/Util/connect'
import { writeFragment } from 'Pixie/Util/files'
import { go } from 'Pixie/Util/navigate'
import { locate } from 'Pixie/Util/registry'
import { Component } from 'react'

const goHome = () => go('/')

export class TopBar extends Component
{
    static Connected = connect({
        tabs: state => state.tabs.toArray(),
        open: ['application', 'layers'],
        theme: ['application', 'theme']
    }, this)

    handleSave = () => writeFragment(
        locate('state').fragments.toArray()[0].pk,
        'test.px'
    )

    handleLoad = () => Operation.load()

    handleActivate = e => applicationTabFocus(
        e.currentTarget.parentNode.dataset.tab
    )

    handleClose = e => Operation.closeTab(
        e.currentTarget.parentNode.dataset.tab
    )

    render ()
    {
        return (
            <div className='TopBar'>
                {this.renderLogo()}
                {this.renderTabs()}
                <div className='TopBar-spacer' />
                {this.renderRight()}
            </div>
        )
    }

    renderLogo ()
    {
        return (
            <div className='TopBar-left'>
                <Icon
                    className='TopBar-control'
                    subtle
                    tight
                    name='bolt'
                    onClick={goHome}
                />
            </div>
        )
    }

    renderTabs ()
    {
        return (
            <div className='TopBar-tabs'>
                {this.props.tabs.map(this.renderTab)}
            </div>
        )
    }

    renderTab = tab =>
    {
        return (
            <div
                key={tab.pk}
                className={classNames(
                    'TopBar-tab',
                    {
                        'TopBar-tab--active': tab.active
                    }
                )}
                data-tab={tab.pk}
            >
                <div
                    className='TopBar-tab-label'
                    onClick={this.handleActivate}
                >
                    {tab.name}
                </div>
                <Icon
                    className='TopBar-close-tab'
                    name='close'
                    onClick={this.handleClose}
                />
            </div>
        )
    }

    renderRight ()
    {
        return (
            <div className='TopBar-right'>
                <Icon
                    className='TopBar-control'
                    tight
                    subtle
                    name='layer-group'
                    active={this.props.open}
                    onClick={applicationLayersToggle}
                />
                {this.renderMenu()}
            </div>
        )
    }

    renderMenu ()
    {
        return (
            <Dropdown>
                <Dropdown.Toggle className='TopBar-control'/>
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
                    onClick={this.handleSave}
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
        )
    }
}
