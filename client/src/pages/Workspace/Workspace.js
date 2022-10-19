import { Page } from 'Pixie/Component/Page'
import { WorkspaceUI } from 'Pixie/Component/UI'
import { Workspace as WorkspaceComponent } from 'Pixie/Component/Workspace'

export const Workspace = () => (
    <Page tight title="Workspace">
        <WorkspaceUI/>
        <WorkspaceComponent.Connected />
    </Page>
)
