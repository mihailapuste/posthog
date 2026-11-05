import type { ReactElement, ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { ToolbarSurface } from './ToolbarSurface'
import { createStyles } from './theme'
import { radii } from './tokens'

interface PillControlProps {
    children: ReactNode
    height?: number
    style?: StyleProp<ViewStyle>
}

export function PillControl({ children, height = 54, style }: PillControlProps): ReactElement {
    const styles = useStyles()
    return <ToolbarSurface style={[styles.pill, { height }, style]}>{children}</ToolbarSurface>
}

const useStyles = createStyles(({ colors }) => ({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.pill,
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
}))
