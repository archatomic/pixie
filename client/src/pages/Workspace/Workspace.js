import { Layers } from 'client/components/layers'
import { Page } from 'client/components/page/Page'
import { Toolbar } from 'client/components/toolbar'
import { Workspace as WorkspaceComponent } from 'client/components/workspace/Workspace'

export const Workspace = () => (
    <Page tight title="Workspace">
        <WorkspaceComponent.Connected />
        <Toolbar.Connected />
        <Layers.Connected />
    </Page>
)