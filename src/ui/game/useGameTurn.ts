import { useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { useGameStore, type ResolvedForfeit } from '@game/gameStore';
import { computeDrawerSplit } from '@game/splitShares';
import { lightTap, mediumTap } from '@platform/haptics';
import { sfx } from '@platform/sfx';
import { LAYOUT_TRANSITION } from '@ui/game/gameConstants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type TurnController = {
  resolved: ResolvedForfeit | null;
  penaltiesApplied: boolean;
  drawCard: (opts: { animateLayout: boolean }) => void;
  handleContinue: () => void;
  finishTurn: (opts: { animateLayout: boolean }) => void;
  onDistributeConfirm: (assignments: Record<string, number>) => void;
  onChooseConfirm: (playerId: string) => void;
  distributeOpen: boolean;
  chooseOpen: boolean;
  closeDistribute: () => void;
  closeChoose: () => void;
  chooseSplitShares: { drawerShare: number; otherShare: number } | null;
};

export function useGameTurn(): TurnController {
  const drawerIndex = useGameStore((s) => s.currentPlayerIndex);
  const players = useGameStore((s) => s.players);
  const drawNextCard = useGameStore((s) => s.drawNextCard);
  const applyPenaltiesTo = useGameStore((s) => s.applyPenaltiesTo);
  const resolveCurrentAce = useGameStore((s) => s.resolveCurrentAce);
  const advanceTurn = useGameStore((s) => s.advanceTurn);

  const drawer = players[drawerIndex];

  const [resolved, setResolved] = useState<ResolvedForfeit | null>(null);
  const [penaltiesApplied, setPenaltiesApplied] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [chooseOpen, setChooseOpen] = useState(false);

  function drawCard({ animateLayout }: { animateLayout: boolean }) {
    mediumTap();
    sfx.play('card_flip').catch(() => undefined);
    const r = drawNextCard();
    if (!r) return;
    if (animateLayout) LayoutAnimation.configureNext(LAYOUT_TRANSITION);
    setResolved(r);
    setPenaltiesApplied(false);
    if (r.template.value === 'A') {
      sfx.play('ace_sting').catch(() => undefined);
      resolveCurrentAce();
      setPenaltiesApplied(true);
      return;
    }
    if (r.template.resolution === 'auto' && r.biasedRandomPlayer && drawer) {
      applyPenaltiesTo({
        [drawer.id]: r.penaltyAmount,
        [r.biasedRandomPlayer.id]: r.penaltyAmount,
      });
      setPenaltiesApplied(true);
    }
  }

  function finishTurn({ animateLayout }: { animateLayout: boolean }) {
    lightTap();
    if (animateLayout) LayoutAnimation.configureNext(LAYOUT_TRANSITION);
    setResolved(null);
    setPenaltiesApplied(false);
    advanceTurn();
  }

  function handleContinue() {
    if (!resolved) return;
    const resolution = resolved.template.resolution;
    if (resolution === 'auto' || penaltiesApplied) {
      finishTurn({ animateLayout: true });
      return;
    }
    if (resolution === 'distribute') {
      setDistributeOpen(true);
      return;
    }
    setChooseOpen(true);
  }

  function onDistributeConfirm(assignments: Record<string, number>) {
    applyPenaltiesTo(assignments);
    setDistributeOpen(false);
    finishTurn({ animateLayout: true });
  }

  function onChooseConfirm(playerId: string) {
    if (!resolved || !drawer) return;
    if (resolved.template.resolution === 'splitDrawerChoose') {
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
    finishTurn({ animateLayout: true });
  }

  const chooseSplitShares =
    resolved && resolved.template.resolution === 'splitDrawerChoose'
      ? computeDrawerSplit(resolved.penaltyAmount)
      : null;

  return {
    resolved,
    penaltiesApplied,
    drawCard,
    handleContinue,
    finishTurn,
    onDistributeConfirm,
    onChooseConfirm,
    distributeOpen,
    chooseOpen,
    closeDistribute: () => setDistributeOpen(false),
    closeChoose: () => setChooseOpen(false),
    chooseSplitShares,
  };
}
