import { Button } from 'Pixie/Component/Button'
import { Component } from 'react'
import { Form } from 'Pixie/Component/Field'
import { Page } from 'Pixie/Component/page/Page'

export class Main extends Component
{
    render ()
    {
        return (
            <Page top>
                <Form>
                    <Button ghost to="/workspace" label="Workspace"/>
                </Form>
            </Page>
        )
    }
}
