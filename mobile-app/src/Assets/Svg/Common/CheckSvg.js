import { Colors, moderateScale } from '@/Theme'
import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = ({ size = 24, color = Colors.black }) => (
  <Svg
    width={moderateScale(size)}
    height={moderateScale(size)}
    viewBox="0 0 24 24"
  >
    <Path
      d="M6.753 11.841a1 1 0 0 0-1.505 1.317l3.5 4a1 1 0 0 0 1.48.028l8.5-9a1 1 0 0 0-1.455-1.373l-7.745 8.2Z"
      fill={color}
    />
  </Svg>
)

export default SvgComponent
