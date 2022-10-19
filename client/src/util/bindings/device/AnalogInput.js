import { DeviceInput } from 'Pixie/util/bindings/device/DeviceInput'
import { def } from 'Pixie/util/default'

export class AnalogInput extends DeviceInput
{
    constructor(id, value)
    {
        super(id, def(value, 0))
    }

    validate (value)
    {
        return (typeof value === 'number')
    }
}