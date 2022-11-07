import { Page } from 'Pixie/Component/Page'
import { Redirect } from 'Pixie/Component/Redirect'
import { WorkspaceUI } from 'Pixie/Component/UI'
import { Workspace as WorkspaceComponent } from 'Pixie/Component/Workspace'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

export const Tab = () =>
{
    const params = useParams()
    const hasTab = useSelector(state => state.tabs.contains(params.tab))
    const lastTab = useSelector(state => state.tabs.last())

    if (!hasTab && !lastTab.null) {
        return <Redirect to={lastTab.route} />
    }

    if (!hasTab) return <Redirect to='/' />

    return (
        <Page tight title="Workspace">
            <WorkspaceUI tab={params.tab} />
            <WorkspaceComponent.Connected tab={params.tab} />
        </Page>
    )
}
