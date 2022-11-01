import { ArraySchemaBuilder } from 'Pixie/Binary/Schema/ArraySchemaBuilder'
import { ObjectSchemaBuilder } from 'Pixie/Binary/Schema/ObjectSchemaBuilder'
import { PrimativeSchemaBuilder } from 'Pixie/Binary/Schema/PrimativeSchemaBuilder'
import { invariant } from 'Pixie/Util/invariant'

export class SchemaBuilder
{
    static create (name, id, type = 'primative')
    {
        invariant(
            this[type] instanceof Function,
            `Invalid schema type ${type}`
        )
        return this[type](name, id)
    }

    static primative (name, id)
    {
        return new PrimativeSchemaBuilder(name, id)
    }

    static object (name, id)
    {
        return new ObjectSchemaBuilder(name, id)
    }

    static array (name, id)
    {
        return new ArraySchemaBuilder(name, id)
    }
}
