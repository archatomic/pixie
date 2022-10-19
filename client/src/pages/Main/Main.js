import { Button } from 'Pixie/components/button'
import { Component } from 'react'
import { Form } from 'Pixie/components/field/Form'
import { Page } from 'Pixie/components/page/Page'

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
