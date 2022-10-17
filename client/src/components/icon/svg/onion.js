import classNames from 'classnames'

import './Onion.styl'

export const OnionSkin = ({
    tight = false,
    on = null,
    x = tight ? 25 : 0,
    y = tight ? 25 : 0,
    width = tight ? 950 : 1000,
    height = tight ? 950 : 1000,
    className
} = {}) => (
    <svg
        className={classNames('SVG Onion', className, { 'Onion--on': on, 'Onion--animates': on === true || on === false })}
        xmlns='http://www.w3.org/2000/svg'
        viewBox={`${x} ${y} ${width} ${height}`}
    >
        <path className='Onion-skin Onion-skin--bottom' d='M435,791.38v30.89A37.73,37.73,0,0,1,397.27,860H177.73A37.73,37.73,0,0,1,140,822.27V602.73A37.73,37.73,0,0,1,177.73,565h36.89A11.39,11.39,0,0,0,226,553.62V511.38A11.39,11.39,0,0,0,214.62,500H177.73A102.74,102.74,0,0,0,75,602.73V822.27A102.74,102.74,0,0,0,177.73,925H397.27A102.74,102.74,0,0,0,500,822.27V791.38A11.39,11.39,0,0,0,488.62,780H446.38A11.39,11.39,0,0,0,435,791.38Z' />
        <rect className='Onion-core' x='287.5' y='293.5' width='425' height='425' rx='102.73' />
        <path className='Onion-skin Onion-skin--top'd='M822.27,75H602.73A102.74,102.74,0,0,0,500,177.73v42.89A11.39,11.39,0,0,0,511.38,232h42.24A11.39,11.39,0,0,0,565,220.62V177.73A37.73,37.73,0,0,1,602.73,140H822.27A37.73,37.73,0,0,1,860,177.73V397.27A37.73,37.73,0,0,1,822.27,435H785.38A11.39,11.39,0,0,0,774,446.38v42.24A11.39,11.39,0,0,0,785.38,500h36.89A102.74,102.74,0,0,0,925,397.27V177.73A102.74,102.74,0,0,0,822.27,75Z' />
    </svg>
)