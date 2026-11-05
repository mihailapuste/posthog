import { Stack, useRouter } from 'expo-router'
import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import type { PinDisplayMode, PinView } from '@/model/views'
import { OverlayHost } from '@/ui/OverlayPortal'
import { Pressable44 } from '@/ui/Pressable44'
import { SceneFrame } from '@/ui/SceneFrame'
import { LoadingView, StateView } from '@/ui/StateView'
import { createStyles, useColors } from '@/ui/theme'
import { type } from '@/ui/tokens'

import { trackEditPinsClosed, trackPinTileSheetOpened } from '../analytics'
import { usePinActions, usePins } from '../pinHooks'
import { resolvePinDisplays } from '../smartPinDisplay'
import { useSmartPinDisplays } from '../useSmartPinDisplays'
import { ViewsToast } from '../ViewsToast'
import { ChooseTileSheet, type ChooseTileTarget } from './ChooseTileSheet'
import { EditPinsList } from './EditPinsList'
import { usePinFlows } from './usePinFlows'

export function EditPinsScreen(): ReactElement {
    const router = useRouter()
    const styles = useStyles()
    const colors = useColors()
    const state = usePins()
    const { displays } = useSmartPinDisplays(state.pins.data, state.displayPrefs)
    const pins = useMemo(
        () => state.pins.data && resolvePinDisplays(state.pins.data, state.displayPrefs, displays),
        [state.pins.data, state.displayPrefs, displays]
    )
    const actions = usePinActions()
    const flows = usePinFlows(actions)
    const [chooseTile, setChooseTile] = useState<ChooseTileTarget | null>(null)
    const session = useRef({
        startedAt: Date.now(),
        changes: 0,
        reason: 'dismissed' as 'done' | 'dismissed',
        closing: false,
    })
    useEffect(() => {
        const current = session.current
        return () =>
            trackEditPinsClosed({
                reason: current.reason,
                changes: current.changes,
                durationSeconds: Math.round((Date.now() - current.startedAt) / 1000),
            })
    }, [])
    const close = useCallback((): void => {
        if (session.current.closing) return
        session.current.closing = true
        session.current.reason = 'done'
        router.back()
    }, [router])
    const showAs = (pin: PinView, mode: PinDisplayMode): void => {
        if (mode !== pin.display.mode) session.current.changes++
        if (actions.setDisplayMode(pin, mode) === 'needs_tile' && mode !== 'row') {
            trackPinTileSheetOpened({ entry: 'show_as', mode })
            setChooseTile({ pin, mode, chooseFirst: true, entry: 'show_as' })
        }
    }

    return (
        <SafeAreaProvider style={styles.screen}>
            <SafeAreaView style={styles.screen} edges={['left', 'right']}>
                <SceneFrame style={styles.screen}>
                    <OverlayHost>
                        <Stack.Screen
                            options={{
                                title: 'Edit pins',
                                headerTintColor: colors.ink,
                                headerRight: () => (
                                    <Pressable44 onPress={close} testID="edit-pins-done">
                                        <Text style={styles.done}>Done</Text>
                                    </Pressable44>
                                ),
                                unstable_headerRightItems: () => [
                                    {
                                        type: 'button',
                                        label: 'Done',
                                        variant: 'plain',
                                        tintColor: colors.ink,
                                        identifier: 'edit-pins-done',
                                        onPress: close,
                                    },
                                ],
                            }}
                        />
                        <View style={styles.screen} testID="edit-pins-modal">
                            {pins ? (
                                <EditPinsList
                                    pins={pins}
                                    onReorder={(ids) => {
                                        session.current.changes++
                                        actions.reorder(ids)
                                    }}
                                    onMove={(pin, direction) => {
                                        session.current.changes++
                                        actions.move(pin, direction)
                                    }}
                                    onMode={showAs}
                                    onRemove={(pin) => {
                                        session.current.changes++
                                        flows.unpin(pin, 'row_menu')
                                    }}
                                />
                            ) : state.pins.isError ? (
                                <StateView
                                    title="Couldn't load your views"
                                    message={state.pins.error?.message}
                                    actionLabel="Done"
                                    onAction={close}
                                />
                            ) : (
                                <LoadingView />
                            )}
                        </View>
                        <ChooseTileSheet
                            target={chooseTile}
                            onClose={() => setChooseTile(null)}
                            onChoose={actions.chooseTile}
                        />
                        <ViewsToast toast={flows.toast} onHide={flows.hideToast} bottom={40} />
                    </OverlayHost>
                </SceneFrame>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const useStyles = createStyles(({ colors }) => ({
    screen: { flex: 1, backgroundColor: colors.background },
    done: { ...type.buttonSmall, color: colors.ink },
}))
