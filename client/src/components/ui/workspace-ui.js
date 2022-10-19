import { Toolbar } from 'Pixie/components/ui/toolbar'
import { Layers } from 'Pixie/components/ui/layers'
import { Top, Left, Right, Bottom, UI } from 'Pixie/components/ui'
import { TopBar } from 'Pixie/components/ui/topbar'
import { BottomBar } from 'Pixie/components/ui/bottombar'

export const WorkspaceUI = ({ children }) => (
    <UI>
        <Top><TopBar.Connected/></Top>
        <Left><Toolbar.Connected/></Left>
        <Right><Layers.Connected/></Right>
        <Bottom><BottomBar.Connected /></Bottom>
        {children}
    </UI>
)
