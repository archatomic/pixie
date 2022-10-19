import { Toolbar } from 'Pixie/Component/UI/Toolbar'
import { Layers } from 'Pixie/Component/UI/Layers'
import { Top, Left, Right, Bottom, UI } from 'Pixie/Component/UI'
import { TopBar } from 'Pixie/Component/UI/TopBar'
import { BottomBar } from 'Pixie/Component/UI/BottomBar'

export const WorkspaceUI = ({ children }) => (
    <UI>
        <Top><TopBar.Connected/></Top>
        <Left><Toolbar.Connected/></Left>
        <Right><Layers.Connected/></Right>
        <Bottom><BottomBar.Connected /></Bottom>
        {children}
    </UI>
)
