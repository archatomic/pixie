import { connect as reduxConnect } from 'react-redux'

const getFromState = (state, props, path) => {
    if (path instanceof Function) return path(state, props)
    if (!Array.isArray(path)) path = [path]
    return state.getIn(path)
}

export const connect = (schema, cls) => {
    if (typeof schema === 'string') schema = [schema]

    return reduxConnect((state, ownProps) => {

        if (schema instanceof Function) {
            return schema(state, ownProps)
        }

        const props = {}

        for (const key of Object.keys(schema)) {
            let name = isNaN(key) ? key : schema[key]
            if (Array.isArray(name)) name = name[name.length - 1]
            props[name] = getFromState(state, ownProps, schema[key])
        }

        return props
    })(cls)
}