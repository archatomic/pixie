import { Dropdown } from 'Pixie/Component/Dropdown'
import { withParams } from 'Pixie/Component/HOC/withParams'
import { Icon } from 'Pixie/Component/Icon'
import { Link } from 'Pixie/Component/Link'
import { applicationLayersToggle, applicationTabFocus, applicationThemeToggle } from 'Pixie/Store/Action/applicationActions'
import { Operation } from 'Pixie/Store/Operation'
import { connect } from 'Pixie/Util/connect'
import { Component } from 'react'

export class TopBar extends Component
{
    static Connected = withParams(connect({
        tabs: state => state.tabs.toArray(),
        open: ['application', 'layers'],
        theme: ['application', 'theme']
    }, this))

    handleSave = () => console.log('TODO')
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
            <Link
                to='/'
                className='TopBar-home'
                activeClassName='TopBar-home--active'
            >
                <Icon
                    className='TopBar-control'
                    tight
                    name='bolt'
                />
            </Link>
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
                className='TopBar-tab'
                data-tab={tab.pk}
            >
                <Link
                    to={tab.route}
                    className='TopBar-tab-label'
                    activeClassName='TopBar-tab-label--active'
                >
                    {tab.name}
                </Link>
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
                {this.renderTabUI()}
                {this.renderMenu()}
            </div>
        )
    }

    renderTabUI ()
    {
        if (!this.props.params.tab) return null
        return (
            <Icon
                className='TopBar-control'
                tight
                subtle
                name='layer-group'
                active={this.props.open}
                onClick={applicationLayersToggle}
            />
        )
    }

    renderMenu ()
    {
        return (
            <Dropdown>
                <Dropdown.Toggle className='TopBar-control'/>
                <Dropdown.Item
                    icon='file-circle-plus'
                    to='/'
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
                    disabled={!this.props.params.tab}
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
