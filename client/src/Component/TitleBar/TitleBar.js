import { HAS_TITLE_BAR, IS_LINUX, IS_WINDOWS } from 'Pixie/constants'

import { makeSafe } from 'Pixie/Util/safeCall'

const handleClose = makeSafe(() => window.close())
const handleMinimize = makeSafe(() => window.electron.minimize())
const handleMaximize = makeSafe(() => window.electron.maximize())

const close = <div
    key={0}
    className='TitleBar-button TitleBar-button--close'
    onClick={handleClose}
/>

const minimize = <div
    key={1}
    className='TitleBar-button TitleBar-button--minimize'
    onClick={handleMinimize}
/>

const maximize = <div
    key={2}
    className='TitleBar-button TitleBar-button--maximize'
    onClick={handleMaximize}
/>

const buttons = IS_WINDOWS || IS_LINUX
    ? [minimize, maximize, close]
    : [close, minimize, maximize]

export const TitleBar = (props) =>
{
    if (!HAS_TITLE_BAR) return null
    return (
        <div className='TitleBar'>
            <div className='TitleBar-buttons'>
                {buttons}
            </div>
            <div className='TitleBar-title'>{props.children}</div>
        </div>
    )
}
