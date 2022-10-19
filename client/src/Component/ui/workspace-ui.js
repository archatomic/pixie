import { Toolbar } from 'Pixie/Component/ui/toolbar'
import { Layers } from 'Pixie/Component/ui/layers'
import { Top, Left, Right, Bottom, UI } from 'Pixie/Component/ui'
import { TopBar } from 'Pixie/Component/ui/topbar'
import { BottomBar } from 'Pixie/Component/ui/bottombar'

export const WorkspaceUI = ({ children }) => (
    <UI>
        <Top><TopBar.Connected/></Top>
        <Left><Toolbar.Connected/></Left>
        <Right><Layers.Connected/></Right>
        <Bottom><BottomBar.Connected /></Bottom>
        {children}
    </UI>
)
