import { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@ui/components/Screen';
import ShotTakeoverModal from '@ui/components/ShotTakeoverModal';
import DistributeModal from '@ui/components/DistributeModal';
import ChoosePenaltyModal from '@ui/components/ChoosePenaltyModal';
import RosterDrawer from '@ui/components/RosterDrawer';
import DrinkResponsiblyModal from '@ui/components/DrinkResponsiblyModal';
import GameHeader from '@ui/game/GameHeader';
import GameFooter from '@ui/game/GameFooter';
import DrawDeck from '@ui/game/DrawDeck';
import ForfeitPanel, { ContinueButton } from '@ui/game/ForfeitPanel';
import { useGameTurn } from '@ui/game/useGameTurn';
import {
  CARD_ASPECT,
  CARD_BASE_WIDTH_LANDSCAPE,
  CARD_BASE_WIDTH_PORTRAIT,
  LANDSCAPE_FORFEIT_MAX_W,
  LANDSCAPE_FORFEIT_MIN_W,
  LANDSCAPE_FORFEIT_WIDTH_RATIO,
} from '@ui/game/gameConstants';
import { useGameStore } from '@game/gameStore';
import { shotProgressRatio } from '@game/penaltyModel';
import { mediumTap } from '@platform/haptics';
import { spacing } from '@ui/theme';

export default function GameScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const players = useGameStore((s) => s.players);
  const currentIndex = useGameStore((s) => s.currentPlayerIndex);
  const deck = useGameStore((s) => s.deck);
  const drawnCard = useGameStore((s) => s.drawnCard);
  const pendingModal = useGameStore((s) => s.pendingModal);
  const dismissShotTakeover = useGameStore((s) => s.dismissShotTakeover);

  const turn = useGameTurn();

  const [rosterOpen, setRosterOpen] = useState(false);
  const [bodyWidth, setBodyWidth] = useState(0);
  const [bodyHeight, setBodyHeight] = useState(0);

  const drawer = players[currentIndex];
  const activePool = useMemo(() => players.filter((p) => p.status === 'active'), [players]);
  const closestToShot = useMemo(() => {
    if (activePool.length === 0) return null;
    return [...activePool].sort((a, b) => shotProgressRatio(b) - shotProgressRatio(a))[0]!;
  }, [activePool]);
  const leastRaw = useMemo(() => {
    if (activePool.length === 0) return null;
    return [...activePool].sort((a, b) => a.rawPenalties - b.rawPenalties)[0]!;
  }, [activePool]);
  const maxRawAmongActive = useMemo(
    () => Math.max(0, ...activePool.map((p) => p.rawPenalties)),
    [activePool],
  );

  if (!drawer) {
    router.replace('/home');
    return null;
  }

  if (deck.length === 0 && !drawnCard) {
    router.replace('/end');
    return null;
  }

  const baseCardW = isLandscape ? CARD_BASE_WIDTH_LANDSCAPE : CARD_BASE_WIDTH_PORTRAIT;
  const baseCardH = Math.round(baseCardW * CARD_ASPECT);
  const landscapeVerticalBudget = Math.max(0, bodyHeight - spacing.lg * 2);
  const cardH =
    isLandscape && landscapeVerticalBudget > 0
      ? Math.min(baseCardH, landscapeVerticalBudget)
      : baseCardH;
  const cardW = isLandscape ? Math.round(cardH / CARD_ASPECT) : baseCardW;
  const cardOffsetX = !isLandscape && bodyWidth > 0 ? Math.max(0, (bodyWidth - cardW) / 2) : 0;
  const landscapeForfeitMaxW = Math.min(
    LANDSCAPE_FORFEIT_MAX_W,
    Math.max(LANDSCAPE_FORFEIT_MIN_W, Math.floor(width * LANDSCAPE_FORFEIT_WIDTH_RATIO)),
  );

  function openRosterFromDeck() {
    mediumTap();
    setRosterOpen(true);
  }

  function onBodyLayout(e: LayoutChangeEvent) {
    setBodyWidth(e.nativeEvent.layout.width);
    setBodyHeight(e.nativeEvent.layout.height);
  }

  const deck$ = (
    <DrawDeck
      drawnCard={drawnCard}
      width={cardW}
      height={cardH}
      cardOffsetX={cardOffsetX}
      onDraw={() => turn.drawCard({ animateLayout: !isLandscape })}
      onOpenSettings={openRosterFromDeck}
    />
  );
  const forfeit$ = (
    <ForfeitPanel
      resolved={turn.resolved}
      drawnCard={drawnCard}
      isLandscape={isLandscape}
      landscapeMaxWidth={landscapeForfeitMaxW}
    />
  );
  const continue$ = <ContinueButton visible={!!turn.resolved} onContinue={turn.handleContinue} />;

  return (
    <Screen padded>
      <View style={styles.frame}>
        <GameHeader
          drawer={drawer}
          deckCount={deck.length}
          onOpenRoster={() => setRosterOpen(true)}
        />

        {isLandscape ? (
          <>
            <View style={[styles.body, styles.bodyRow]} onLayout={onBodyLayout}>
              <View style={styles.landscapeCluster}>
                {deck$}
                {forfeit$}
              </View>
            </View>
            {turn.resolved ? continue$ : null}
          </>
        ) : (
          <View style={[styles.body, styles.bodyColumnCenter]} onLayout={onBodyLayout}>
            {deck$}
            {turn.resolved ? (
              <View style={styles.portraitStack}>
                {forfeit$}
                {continue$}
              </View>
            ) : null}
          </View>
        )}

        <GameFooter
          closestToShot={closestToShot}
          leastRaw={leastRaw}
          maxRaw={maxRawAmongActive}
          isLandscape={isLandscape}
        />
      </View>

      {pendingModal?.kind === 'shotTakeover' ? (
        <ShotTakeoverModal
          player={players.find((p) => p.id === pendingModal.playerId)!}
          shots={pendingModal.shots}
          onDismiss={dismissShotTakeover}
        />
      ) : null}

      {turn.distributeOpen && turn.resolved ? (
        <DistributeModal
          amount={turn.resolved.penaltyAmount}
          drawer={drawer}
          players={activePool}
          onCancel={turn.closeDistribute}
          onConfirm={turn.onDistributeConfirm}
        />
      ) : null}

      {turn.chooseOpen && turn.resolved ? (
        <ChoosePenaltyModal
          amount={
            turn.chooseSplitShares ? turn.chooseSplitShares.otherShare : turn.resolved.penaltyAmount
          }
          drawer={drawer}
          players={activePool}
          biasedPlayer={turn.resolved.biasedRandomPlayer}
          drawerAutoShare={turn.chooseSplitShares?.drawerShare}
          onCancel={turn.closeChoose}
          onConfirm={turn.onChooseConfirm}
        />
      ) : null}

      {rosterOpen ? <RosterDrawer onClose={() => setRosterOpen(false)} /> : null}
      <DrinkResponsiblyModal />
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
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
    paddingTop: spacing.lg,
  },
});
