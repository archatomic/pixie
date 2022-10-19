import { Page } from 'Pixie/Component/Page'
import { WorkspaceUI } from 'Pixie/Component/ui/workspace-ui'
import { Workspace as WorkspaceComponent } from 'Pixie/Component/workspace/Workspace'

export const Workspace = () => (
    <Page tight title="Workspace">
        <WorkspaceUI/>
        <WorkspaceComponent.Connected />
    </Page>
)
