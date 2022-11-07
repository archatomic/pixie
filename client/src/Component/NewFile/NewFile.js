import { Button } from 'Pixie/Component/Button'
import { Form, NumberField } from 'Pixie/Component/Field'
import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_WIDTH } from 'Pixie/constants'
import { Operation } from 'Pixie/Store/Operation'
import { go } from 'Pixie/Util/navigate'
import { Component } from 'react'

export class NewFile extends Component
{
    handleSubmit = ({ width, height }) =>
    {
        Operation.createFragment({ width, height })
        go('/workspace')
    }

    render ()
    {
        return (
            <div className='NewFile'>
                <Form className='NewFile-form' onSubmit={this.handleSubmit}>
                    <NumberField
                        className='NewFile-field'
                        name='width'
                        label='Width'
                        value={DEFAULT_FRAGMENT_WIDTH}
                    />
                    <NumberField
                        className='NewFile-field'
                        name='height'
                        label='Height'
                        value={DEFAULT_FRAGMENT_HEIGHT}
                    />
                    <Button full submit ghost label='Create New' />
                </Form>
            </div>
        )
    }
}
