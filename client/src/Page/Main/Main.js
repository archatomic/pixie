import { Button } from 'Pixie/Component/Button'
import { Component } from 'react'
import { Form } from 'Pixie/Component/Field'
import { Page } from 'Pixie/Component/Page'
import { NewFile } from 'Pixie/Component/NewFile'

export class Main extends Component
{
    render ()
    {
        return (
            <Page>
                <NewFile/>
            </Page>
        )
    }
}
