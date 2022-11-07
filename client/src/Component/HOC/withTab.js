import { locate } from 'Pixie/Util/registry'
import { useSelector } from 'react-redux'
import { matchPath, useParams } from 'react-router'

export const getTab = () =>
{
    const { params } = matchPath(
        '/tab/:tab',
        window.location.pathname
    )
    return locate('state').tabs.find(params.tab)
}

export const useTab = (id = null) =>
{
    const params = useParams()
    id = id || params.tab
    const tab = useSelector(state => state.tabs.find(id))
    return tab
}

export const withTab = Wrapped => props =>
{
    const tab = useTab(props.tab)
    return <Wrapped tab={tab} {...props}/>
}
