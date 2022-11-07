import { useTab } from 'Pixie/Component/HOC/withTab'
import { Page } from 'Pixie/Component/Page'
import { Redirect } from 'Pixie/Component/Redirect'
import { WorkspaceUI } from 'Pixie/Component/UI'
import { Workspace as WorkspaceComponent } from 'Pixie/Component/Workspace'
import { useSelector } from 'react-redux'

export const Tab = () =>
{
    const tab = useTab()
    const lastTab = useSelector(state => state.tabs.last())

    if (tab.null) {
        const to = lastTab.null ? '/' : lastTab.route
        return <Redirect to={to} />
    }

    return (
        <Page tight title={tab.name} key={tab.pk}>
            <WorkspaceUI tab={tab.pk} />
            <WorkspaceComponent.Connected tab={tab.pk} />
        </Page>
    )
}
