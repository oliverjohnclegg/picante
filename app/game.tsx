import { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  type LayoutChangeEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import Screen from '@ui/components/Screen';
import Text from '@ui/components/Text';
import Button from '@ui/components/Button';
import CardArt from '@ui/svg/CardArt';
import DeckCard from '@ui/svg/DeckCard';
import DeckHoldOverlay from '@ui/components/DeckHoldOverlay';
import PlayerChip from '@ui/components/PlayerChip';
import ShotTakeoverModal from '@ui/components/ShotTakeoverModal';
import DistributeModal from '@ui/components/DistributeModal';
import ChoosePenaltyModal from '@ui/components/ChoosePenaltyModal';
import RosterDrawer from '@ui/components/RosterDrawer';
import DrinkResponsiblyModal from '@ui/components/DrinkResponsiblyModal';
import { useGameStore, type ResolvedForfeit } from '@game/gameStore';
import { colors, spacing, suitColors } from '@ui/theme';
import { strings } from '@i18n/en';
import { lightTap, mediumTap } from '@platform/haptics';
import { sfx } from '@platform/sfx';
import { shotProgressRatio } from '@game/penaltyModel';
import { cardTitle } from '@game/cardTitle';
import { computeDrawerSplit } from '@game/splitShares';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CARD_ASPECT = 320 / 220;
const GAP = spacing.lg;
const HOLD_FOR_SETTINGS_MS = 650;
const ANIM = {
  slide: 420,
  reveal: 320,
  panelDelay: 260,
} as const;

const LAYOUT_TRANSITION = {
  duration: 360,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
} as const;

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const players = useGameStore((s) => s.players);
  const currentIndex = useGameStore((s) => s.currentPlayerIndex);
  const deck = useGameStore((s) => s.deck);
  const drawnCard = useGameStore((s) => s.drawnCard);
  const pendingModal = useGameStore((s) => s.pendingModal);
  const drawNextCard = useGameStore((s) => s.drawNextCard);
  const applyPenaltiesTo = useGameStore((s) => s.applyPenaltiesTo);
  const resolveCurrentAce = useGameStore((s) => s.resolveCurrentAce);
  const advanceTurn = useGameStore((s) => s.advanceTurn);
  const dismissShotTakeover = useGameStore((s) => s.dismissShotTakeover);

  const [resolved, setResolved] = useState<ResolvedForfeit | null>(null);
  const [penaltiesApplied, setPenaltiesApplied] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [chooseOpen, setChooseOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [deckPressing, setDeckPressing] = useState(false);
  const [bodyWidth, setBodyWidth] = useState(0);
  const [bodyHeight, setBodyHeight] = useState(0);

  const drawer = players[currentIndex];

  const spotlightPool = useMemo(() => players.filter((p) => p.status === 'active'), [players]);

  const closestToShotPlayer = useMemo(() => {
    if (spotlightPool.length === 0) return null;
    return [...spotlightPool].sort((a, b) => shotProgressRatio(b) - shotProgressRatio(a))[0]!;
  }, [spotlightPool]);

  const leastRawPlayer = useMemo(() => {
    if (spotlightPool.length === 0) return null;
    return [...spotlightPool].sort((a, b) => a.rawPenalties - b.rawPenalties)[0]!;
  }, [spotlightPool]);

  const maxRawAmongActive = useMemo(() => {
    const actives = players.filter((p) => p.status === 'active');
    return Math.max(0, ...actives.map((p) => p.rawPenalties));
  }, [players]);

  if (!drawer) {
    router.replace('/home');
    return null;
  }

  if (deck.length === 0 && !drawnCard) {
    router.replace('/end');
    return null;
  }

  const baseCardW = isLandscape ? 200 : 140;
  const baseCardH = Math.round(baseCardW * CARD_ASPECT);
  const landscapeVerticalBudget = Math.max(0, bodyHeight - spacing.lg * 2);
  const cardH =
    isLandscape && landscapeVerticalBudget > 0
      ? Math.min(baseCardH, landscapeVerticalBudget)
      : baseCardH;
  const cardW = isLandscape ? Math.round(cardH / CARD_ASPECT) : baseCardW;
  const resolution = resolved?.template.resolution ?? 'choose';
  const isAce = drawnCard?.value === 'A';

  const cardOffsetX = !isLandscape && bodyWidth > 0 ? Math.max(0, (bodyWidth - cardW) / 2) : 0;

  const landscapeForfeitMaxW = Math.min(420, Math.max(260, Math.floor(width * 0.34)));

  function openDeckSettings() {
    mediumTap();
    setDeckPressing(false);
    setRosterOpen(true);
  }

  function handleDraw() {
    mediumTap();
    sfx.play('card_flip').catch(() => undefined);
    const r = drawNextCard();
    if (!r) return;
    if (!isLandscape) LayoutAnimation.configureNext(LAYOUT_TRANSITION);
    setResolved(r);
    setPenaltiesApplied(false);
    if (r.template.value === 'A') {
      sfx.play('ace_sting').catch(() => undefined);
      resolveCurrentAce();
      setPenaltiesApplied(true);
    } else if (r.template.resolution === 'auto' && r.biasedRandomPlayer) {
      applyPenaltiesTo({
        [drawer!.id]: r.penaltyAmount,
        [r.biasedRandomPlayer.id]: r.penaltyAmount,
      });
      setPenaltiesApplied(true);
    }
  }

  function finishTurn() {
    lightTap();
    if (!isLandscape) LayoutAnimation.configureNext(LAYOUT_TRANSITION);
    setResolved(null);
    setPenaltiesApplied(false);
    advanceTurn();
  }

  function handleContinue() {
    if (!resolved) return;
    if (resolution === 'auto' || penaltiesApplied) {
      finishTurn();
      return;
    }
    if (resolution === 'distribute') {
      setDistributeOpen(true);
    } else {
      setChooseOpen(true);
    }
  }

  function onChooseConfirm(playerId: string) {
    if (!resolved || !drawer) return;
    if (resolution === 'splitDrawerChoose') {
      const { drawerShare, otherShare } = computeDrawerSplit(resolved.penaltyAmount);
      const assignments: Record<string, number> = { [drawer.id]: drawerShare };
      if (otherShare > 0) {
        assignments[playerId] = (assignments[playerId] ?? 0) + otherShare;
      }
      applyPenaltiesTo(assignments);
    } else {
      applyPenaltiesTo({ [playerId]: resolved.penaltyAmount });
    }
    setChooseOpen(false);
    finishTurn();
  }

  function onDistributeConfirm(assignments: Record<string, number>) {
    applyPenaltiesTo(assignments);
    setDistributeOpen(false);
    finishTurn();
  }

  function onBodyLayout(e: LayoutChangeEvent) {
    setBodyWidth(e.nativeEvent.layout.width);
    setBodyHeight(e.nativeEvent.layout.height);
  }

  const suitAccent = drawnCard ? suitColors[drawnCard.suit] : colors.orange;

  const cardSlot = (
    <MotiView
      animate={{ translateX: resolved ? 0 : cardOffsetX }}
      transition={{ type: 'timing', duration: ANIM.slide }}
      style={{ width: cardW, height: cardH }}
    >
      <Pressable
        onPress={drawnCard ? undefined : handleDraw}
        onLongPress={drawnCard ? undefined : openDeckSettings}
        delayLongPress={HOLD_FOR_SETTINGS_MS}
        onPressIn={() => !drawnCard && setDeckPressing(true)}
        onPressOut={() => setDeckPressing(false)}
        disabled={!!drawnCard}
        style={{ width: cardW, height: cardH }}
      >
        <MotiView
          style={StyleSheet.absoluteFill}
          animate={{
            opacity: drawnCard ? 0 : 1,
            scale: drawnCard ? 0.92 : 1,
          }}
          transition={{ type: 'timing', duration: 240 }}
          pointerEvents={drawnCard ? 'none' : 'auto'}
        >
          <DeckCard width={cardW} height={cardH} />
        </MotiView>
        <DeckHoldOverlay
          pressing={deckPressing && !drawnCard}
          width={cardW}
          height={cardH}
          holdDurationMs={HOLD_FOR_SETTINGS_MS}
        />
        <MotiView
          style={StyleSheet.absoluteFill}
          animate={{
            opacity: drawnCard ? 1 : 0,
            scale: drawnCard ? 1 : 0.92,
          }}
          transition={{
            type: 'timing',
            duration: ANIM.reveal,
            delay: drawnCard ? 140 : 0,
          }}
          pointerEvents="none"
        >
          {drawnCard ? <CardArt card={drawnCard} width={cardW} height={cardH} /> : null}
        </MotiView>
      </Pressable>
    </MotiView>
  );

  const forfeitContent =
    resolved && drawnCard ? (
      <>
        <Text variant="displayLG" color={suitAccent} numberOfLines={2} style={styles.centerText}>
          {cardTitle(drawnCard)}
        </Text>
        <Text variant="bodyLG" style={[styles.forfeitText, styles.centerText]}>
          {resolved.renderedText}
        </Text>
        {!isAce ? (
          <Text variant="labelSM" color={colors.yellow} style={[styles.stake, styles.centerText]}>
            {resolved.penaltyAmount} PENALTIES ON THE LINE
          </Text>
        ) : null}
      </>
    ) : null;

  const forfeitSlot = (
    <MotiView
      style={[
        isLandscape ? styles.forfeitPanelLandscape : styles.forfeitPanelPortrait,
        isLandscape && { maxWidth: landscapeForfeitMaxW },
      ]}
      animate={{
        opacity: resolved ? 1 : 0,
        translateX: resolved ? 0 : isLandscape ? 12 : 0,
        translateY: resolved ? 0 : isLandscape ? 0 : 8,
      }}
      transition={{
        type: 'timing',
        duration: 340,
        delay: resolved ? ANIM.panelDelay : 0,
      }}
      pointerEvents={resolved ? 'auto' : 'none'}
    >
      {forfeitContent}
    </MotiView>
  );

  const continueSlot = (
    <MotiView
      style={styles.continueWrap}
      animate={{
        opacity: resolved ? 1 : 0,
        translateY: resolved ? 0 : 8,
      }}
      transition={{
        type: 'timing',
        duration: 280,
        delay: resolved ? ANIM.panelDelay + 80 : 0,
      }}
      pointerEvents={resolved ? 'auto' : 'none'}
    >
      <View style={styles.continueInner}>
        <Button
          label={strings.draw.continue}
          variant="primary"
          fullWidth
          onPress={handleContinue}
        />
      </View>
    </MotiView>
  );

  return (
    <Screen padded>
      <View style={styles.frame}>
        <View style={styles.header}>
          <Pressable onPress={() => setRosterOpen(true)}>
            <Text variant="labelSM" color={colors.textMuted}>
              {strings.game.roster.toUpperCase()}
            </Text>
            <Text variant="displayMD" numberOfLines={1}>
              {drawer.name}
              <Text variant="displayMD" color={colors.textMuted}>
                {strings.game.turnOf}
              </Text>
            </Text>
          </Pressable>
          <View style={styles.deckCount}>
            <Text variant="displayMD">{deck.length}</Text>
            <Text variant="labelSM" color={colors.textMuted}>
              {strings.game.cardsLeft.toUpperCase()}
            </Text>
          </View>
        </View>

        {isLandscape ? (
          <>
            <View style={[styles.body, styles.bodyRow]} onLayout={onBodyLayout}>
              <View style={styles.landscapeCluster}>
                {cardSlot}
                {forfeitSlot}
              </View>
            </View>
            {resolved ? continueSlot : null}
          </>
        ) : (
          <View style={[styles.body, styles.bodyColumnCenter]} onLayout={onBodyLayout}>
            {cardSlot}
            {resolved ? (
              <View style={styles.portraitStack}>
                {forfeitSlot}
                {continueSlot}
              </View>
            ) : null}
          </View>
        )}

        <View style={[styles.footer, isLandscape && styles.footerLandscape]}>
          <View style={[styles.footerStats, isLandscape && styles.footerStatsLandscape]}>
            <View style={[styles.footerStatCol, isLandscape && styles.footerStatColLandscape]}>
              <Text variant="labelSM" color={colors.textMuted} style={styles.footerStatLabel}>
                {strings.game.closestToShot.toUpperCase()}
              </Text>
              {closestToShotPlayer ? (
                <View style={isLandscape ? styles.footerChipWrap : undefined}>
                  <PlayerChip player={closestToShotPlayer} size="sm" fullWidth />
                </View>
              ) : null}
            </View>
            <View style={[styles.footerStatCol, isLandscape && styles.footerStatColLandscape]}>
              <Text variant="labelSM" color={colors.textMuted} style={styles.footerStatLabel}>
                {strings.game.leastPenalties.toUpperCase()}
              </Text>
              {leastRawPlayer ? (
                <View style={isLandscape ? styles.footerChipWrap : undefined}>
                  <PlayerChip
                    player={leastRawPlayer}
                    size="sm"
                    ringMetric="raw"
                    rawProgressMax={maxRawAmongActive}
                    fullWidth
                  />
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {pendingModal?.kind === 'shotTakeover' ? (
        <ShotTakeoverModal
          player={players.find((p) => p.id === pendingModal.playerId)!}
          shots={pendingModal.shots}
          onDismiss={dismissShotTakeover}
        />
      ) : null}

      {distributeOpen && resolved ? (
        <DistributeModal
          amount={resolved.penaltyAmount}
          drawer={drawer}
          players={players.filter((p) => p.status === 'active')}
          onCancel={() => setDistributeOpen(false)}
          onConfirm={onDistributeConfirm}
        />
      ) : null}

      {chooseOpen && resolved
        ? (() => {
            const split =
              resolution === 'splitDrawerChoose'
                ? computeDrawerSplit(resolved.penaltyAmount)
                : null;
            const chooseAmount = split ? split.otherShare : resolved.penaltyAmount;
            return (
              <ChoosePenaltyModal
                amount={chooseAmount}
                drawer={drawer}
                players={players.filter((p) => p.status === 'active')}
                biasedPlayer={resolved.biasedRandomPlayer}
                drawerAutoShare={split?.drawerShare}
                onCancel={() => setChooseOpen(false)}
                onConfirm={onChooseConfirm}
              />
            );
          })()
        : null}

      {rosterOpen ? <RosterDrawer onClose={() => setRosterOpen(false)} /> : null}
      <DrinkResponsiblyModal />
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deckCount: { alignItems: 'flex-end' },
  body: {
    flex: 1,
    paddingVertical: spacing.lg,
    overflow: 'hidden',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    maxWidth: '100%',
  },
  bodyColumnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitStack: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: GAP,
  },
  forfeitPanelLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  forfeitPanelPortrait: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  forfeitText: { marginTop: spacing.md, lineHeight: 26 },
  stake: { marginTop: spacing.md },
  centerText: { textAlign: 'center' },
  continueWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
  },
  continueInner: {
    width: '100%',
    maxWidth: 320,
  },
  footer: { paddingTop: spacing.md },
  footerLandscape: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  footerStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  footerStatsLandscape: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  footerStatCol: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  footerStatColLandscape: {
    alignItems: 'center',
  },
  footerChipWrap: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  footerStatLabel: {
    alignSelf: 'stretch',
    width: '100%',
    textAlign: 'center',
  },
});
