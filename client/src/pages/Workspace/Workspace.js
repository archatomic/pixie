import { Page } from 'Pixie/components/page/Page'
import { WorkspaceUI } from 'Pixie/components/ui/workspace-ui'
import { Workspace as WorkspaceComponent } from 'Pixie/components/workspace/Workspace'

export const Workspace = () => (
    <Page tight title="Workspace">
        <WorkspaceUI/>
        <WorkspaceComponent.Connected />
    </Page>
)