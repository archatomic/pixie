import { Icon } from 'client/components/icon/icon'
import { applicationLayersToggle, applicationThemeToggle } from 'client/store/actions/applicationActions'
import { connect } from 'client/util/connect'
import { go } from 'client/util/navigate'
import { Component } from 'react'

const goHome = () => go('/')

export class TopBar extends Component
{
    static Connected = connect({
        open: ['application', 'layers'],
        theme: ['application', 'theme']
    }, this)

    render ()
    {
        return (
            <div className='TopBar'>
                <div className='TopBar-left'>
                    <Icon subtle tight name='bolt' onClick={goHome}/>
                </div>
                <div className='TopBar-spacer'/>
                <div className='TopBar-right'>
                    <Icon
                        tight
                        subtle
                        name={this.props.theme === 'light' ? 'sun' : 'moon'}
                        onClick={applicationThemeToggle}
                    />
                    <Icon
                        tight
                        subtle
                        name='layer-group'
                        active={this.props.open}
                        onClick={applicationLayersToggle}
                    />
                </div>
            </div>
        )
    }
}