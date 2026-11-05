import { type ReactElement, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { type TabSelectedEvent, Tabs } from 'react-native-screens'

import { useTheme } from '@/ui/theme'

import type { BottomBarSlot } from './BottomBar'
import type { NavPin } from './navPinStore'

interface NativeTabStripProps {
    selected: BottomBarSlot
    pins: readonly NavPin[]
    onHome: () => void
    onChats: () => void
    onViews: () => void
    onPin: (pin: NavPin) => void
}

export function NativeTabStrip({ selected, pins, onHome, onChats, onViews, onPin }: NativeTabStripProps): ReactElement {
    const { colors, scheme } = useTheme()
    const provenance = useRef(0)
    const slots = [
        { key: 'home', label: 'Home', icon: 'house', testID: 'inbox-nav-home', onPress: onHome },
        {
            key: 'chats',
            label: 'Chats',
            icon: 'bubble.left.and.bubble.right',
            testID: 'inbox-nav-chat',
            onPress: onChats,
        },
        { key: 'views', label: 'Views', icon: 'square.grid.2x2', testID: 'inbox-nav-views', onPress: onViews },
        ...pins.map((pin) => ({
            key: pin,
            label: pin === 'errors' ? 'Errors' : 'Sessions',
            icon: pin === 'errors' ? 'exclamationmark.triangle' : 'play.rectangle',
            testID: `nav-pin-${pin}`,
            onPress: () => onPin(pin),
        })),
    ]
    const itemAppearance = {
        normal: { tabBarItemIconColor: colors.ink },
        selected: { tabBarItemIconColor: colors.ink },
    }
    const appearance = { stacked: itemAppearance, inline: itemAppearance, compactInline: itemAppearance }

    return (
        <View style={styles.frame} pointerEvents="box-none">
            <Tabs.Host
                style={styles.host}
                colorScheme={scheme}
                nativeContainerStyle={{ backgroundColor: 'transparent' }}
                ios={{ tabBarMinimizeBehavior: 'never', tabBarControllerMode: 'tabBar', tabBarTintColor: colors.ink }}
                navStateRequest={{ selectedScreenKey: selected, baseProvenance: provenance.current }}
                onTabSelected={({ nativeEvent }: { nativeEvent: TabSelectedEvent }) => {
                    provenance.current = nativeEvent.provenance
                    if (nativeEvent.actionOrigin !== 'programmatic-js') {
                        slots.find((slot) => slot.key === nativeEvent.selectedScreenKey)?.onPress()
                    }
                }}
            >
                {slots.map((slot) => (
                    <Tabs.Screen
                        key={slot.key}
                        screenKey={slot.key}
                        title=""
                        tabBarItemTestID={slot.testID}
                        tabBarItemAccessibilityLabel={slot.label}
                        ios={{
                            icon: { type: 'sfSymbol', name: slot.icon },
                            standardAppearance: appearance,
                            scrollEdgeAppearance: appearance,
                        }}
                    >
                        {/* Routes render outside these controllers so the native strip can share a row with Chat. */}
                        <View pointerEvents="none" style={styles.empty} />
                    </Tabs.Screen>
                ))}
            </Tabs.Host>
        </View>
    )
}

const styles = StyleSheet.create({
    frame: { flex: 1, height: 64 },
    host: { position: 'absolute', left: -10, right: -10, bottom: -20, height: 110 },
    empty: { flex: 1, backgroundColor: 'transparent' },
})
