import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect'
import type { ReactElement } from 'react'
import { type ColorValue, View, type ViewProps, type ViewStyle } from 'react-native'

import { useTheme } from './theme'

export const liquidGlassAvailable = isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

export const transparentToolbarStyle: ViewStyle = {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    boxShadow: 'none',
}

interface ToolbarSurfaceProps extends ViewProps {
    tintColor?: ColorValue
    interactive?: boolean
}

export function ToolbarSurface({ style, tintColor, interactive = true, ...props }: ToolbarSurfaceProps): ReactElement {
    const { scheme } = useTheme()
    if (!liquidGlassAvailable) {
        return <View {...props} style={style} />
    }
    return (
        <GlassView
            {...props}
            style={[style, transparentToolbarStyle]}
            glassEffectStyle="regular"
            colorScheme={scheme}
            tintColor={tintColor}
            isInteractive={interactive}
        />
    )
}
