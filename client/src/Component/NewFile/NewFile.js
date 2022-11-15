import { Button } from 'Pixie/Component/Button'
import { Explorer } from 'Pixie/Component/Explorer'
import { Form, NumberField, TextField } from 'Pixie/Component/Field'
import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_WIDTH } from 'Pixie/constants'
import { Operation } from 'Pixie/Store/Operation'
import { Component } from 'react'

export class NewFile extends Component
{
    handleSubmit = ({ name, width, height }) =>
    {
        Operation.createFragment({ name, width, height })
    }

    render ()
    {
        return (
            <div className='NewFile'>
                <Form className='NewFile-form' onSubmit={this.handleSubmit}>
                    <TextField
                        className='NewFile-field'
                        name='name'
                        label='Project'
                        value='New Sprite'
                        autoSelectOnFocus
                        autofocus
                    />
                    <Form.Row>
                        <NumberField
                            className='NewFile-field'
                            name='width'
                            label='Width'
                            value={DEFAULT_FRAGMENT_WIDTH}
                            autoSelectOnFocus
                        />
                        <NumberField
                            className='NewFile-field'
                            name='height'
                            label='Height'
                            value={DEFAULT_FRAGMENT_HEIGHT}
                            autoSelectOnFocus
                        />
                    </Form.Row>
                    <Form.Row right>
                        <Button
                            className='NewFile-button'
                            submit
                            pill
                            gradient
                            label='Create'
                        />
                    </Form.Row>
                </Form>
                <Explorer recent top={9} extension='px'/>
            </div>
        )
    }
}
