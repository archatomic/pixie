import { useParams } from 'react-router'

export const withParams = WrappedComponent =>
{
    return (props) =>
    {
        const params = useParams()
        return <WrappedComponent params={params} {...props} />
    }
}
