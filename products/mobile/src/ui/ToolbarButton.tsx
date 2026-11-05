import type { ReactElement } from 'react'
import { type ColorValue, StyleSheet } from 'react-native'

import { Pressable44, type Pressable44Props } from './Pressable44'
import { liquidGlassAvailable, ToolbarSurface, transparentToolbarStyle } from './ToolbarSurface'
import { radii } from './tokens'

interface ToolbarButtonProps extends Pressable44Props {
    tintColor?: ColorValue
}

export function ToolbarButton({
    children,
    style,
    pressedBackground,
    pressedStyle,
    tintColor,
    ...props
}: ToolbarButtonProps): ReactElement {
    if (!liquidGlassAvailable) {
        return (
            <Pressable44 {...props} style={style} pressedBackground={pressedBackground} pressedStyle={pressedStyle}>
                {children}
            </Pressable44>
        )
    }

    const { alignSelf, ...buttonStyle } = StyleSheet.flatten(style) ?? {}
    return (
        <ToolbarSurface
            interactive={!props.disabled}
            tintColor={tintColor}
            style={{ alignSelf, borderRadius: buttonStyle.borderRadius ?? radii.pill }}
        >
            <Pressable44 {...props} style={[buttonStyle, transparentToolbarStyle]}>
                {children}
            </Pressable44>
        </ToolbarSurface>
    )
}
