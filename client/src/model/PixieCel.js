import { DEFAULT_FRAGMENT_HEIGHT, DEFAULT_FRAGMENT_WIDTH } from 'client/constants'

import { Record } from './Record'
import { createImageData } from 'client/util/graphics'

export class PixieCel extends Record({
    x: 0,
    y: 0,
    width: DEFAULT_FRAGMENT_WIDTH,
    height: DEFAULT_FRAGMENT_HEIGHT,
    data: (props) =>
    {
        if (props._isNull) return null // Don't create image data
        return createImageData(props.width, props.height)
    },
    inherited: true
}) { }
