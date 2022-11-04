import { isDefined } from 'Pixie/Util/default'

class SchemaRepository
{
    schemas = {}
    idMap = new Map()

    add (schema)
    {
        if (!this.schemas[schema.name]) {
            this.schemas[schema.name] = []
            if (isDefined(schema.id)) {
                this.idMap.set(schema.id, schema.name)
            }
        }

        const versions = this.schemas[schema.name]
        schema.version = versions.length
        versions.push(schema)
    }

    get (schema, version = null)
    {
        if (this.idMap.has(schema))
            schema = this.idMap.get(schema)

        const versions = this.schemas[schema]
        if (!versions) throw new Error(`Unknown schema provided: ${schema}`)
        if (version === null) version = versions.length - 1
        return versions[version] || null
    }

    has (schema)
    {
        if (this.idMap.has(schema))
            schema = this.idMap.get(schema)
        return !!this.schemas[schema]
    }
}

export const schemaRepository = new SchemaRepository()
