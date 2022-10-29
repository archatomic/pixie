class SchemaRepository
{
    schemas = {}
    idMap = {}

    add (schema)
    {
        if (!this.schemas[schema.name]) {
            this.schemas[schema.name] = []
            this.idMap[schema.id] = schema.name
        }

        const versions = this.schemas[schema.name]
        schema.version = versions.length
        versions.push(schema)
    }

    get (schema, version = null)
    {
        if (typeof schema === 'number') {
            // Convert id to name
            schema = this.idMap[schema]
        }

        const versions = this.schemas[schema]
        if (!versions) return null
        if (version === null) version = versions.length - 1
        return versions[version] || null
    }
}

export const schemaRepository = new SchemaRepository()
