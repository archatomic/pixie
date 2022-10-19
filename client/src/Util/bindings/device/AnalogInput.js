import { DeviceInput } from 'Pixie/Util/bindings/device/DeviceInput'
import { def } from 'Pixie/Util/default'

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
