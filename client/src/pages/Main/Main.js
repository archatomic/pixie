import { Button } from 'client/components/button'
import { Component } from 'react'
import { Form } from 'client/components/field/Form'
import { Page } from "client/components/page/Page";

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
