import { Toolbar } from 'client/components/ui/toolbar'
import { Layers } from 'client/components/ui/layers'
import { Top, Left, Right, Bottom, UI } from 'client/components/ui'
import { TopBar } from 'client/components/ui/topbar'
import { BottomBar } from 'client/components/ui/bottombar'

export const WorkspaceUI = ({ children }) => (
    <UI>
        <Top><TopBar.Connected/></Top>
        <Left><Toolbar.Connected/></Left>
        <Right><Layers.Connected/></Right>
        <Bottom><BottomBar.Connected /></Bottom>
        {children}
    </UI>
)
