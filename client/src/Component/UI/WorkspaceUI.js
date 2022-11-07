import { Toolbar } from 'Pixie/Component/UI/Toolbar'
import { Layers } from 'Pixie/Component/UI/Layers'
import { Left, Right, Bottom, UI } from 'Pixie/Component/UI'
import { BottomBar } from 'Pixie/Component/UI/BottomBar'

export const WorkspaceUI = ({ children }) => (
    <UI>
        <Left><Toolbar.Connected/></Left>
        <Right><Layers.Connected/></Right>
        <Bottom><BottomBar.Connected /></Bottom>
        {children}
    </UI>
)
