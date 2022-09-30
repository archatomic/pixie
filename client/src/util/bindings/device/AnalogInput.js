import { DeviceInput } from 'client/util/bindings/device/DeviceInput'
import { def } from 'client/util/default'

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