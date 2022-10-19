import classNames from 'classnames'

export const ColorSwatch = ({
    color,
    gridSize = '2rem',
    className,
    ...props
} = {}) =>
{
    const style = {
        '--color': color.getCSS({ a: 1 }),
        '--opacity': 1 - color.a,
        '--grid-size': gridSize
    }

    return <div
        {...props}
        className={classNames('ColorSwatch', className)}
        style={style}
    />
}
