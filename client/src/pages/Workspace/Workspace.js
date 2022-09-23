import { Page } from 'client/components/page/Page'
import { WorkspaceUI } from 'client/components/ui/workspace-ui'
import { Workspace as WorkspaceComponent } from 'client/components/workspace/Workspace'

export const Workspace = () => (
    <Page tight title="Workspace">
        <WorkspaceUI/>
        <WorkspaceComponent.Connected />
    </Page>
)