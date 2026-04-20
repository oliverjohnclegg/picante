import { StyleSheet, View } from 'react-native';
import type { Player } from '@game/types';
import Text from '@ui/components/Text';
import PlayerChip from '@ui/components/PlayerChip';
import { colors, spacing } from '@ui/theme';
import { strings } from '@i18n/en';
import { FOOTER_LANDSCAPE_MAX_WIDTH } from '@ui/game/gameConstants';

type Props = {
  closestToShot: Player | null;
  leastRaw: Player | null;
  maxRaw: number;
  isLandscape: boolean;
};

export default function GameFooter({ closestToShot, leastRaw, maxRaw, isLandscape }: Props) {
  return (
    <View style={[styles.root, isLandscape && styles.rootLandscape]}>
      <View style={[styles.stats, isLandscape && styles.statsLandscape]}>
        <FooterColumn
          label={strings.game.closestToShot}
          player={closestToShot}
          isLandscape={isLandscape}
        />
        <FooterColumn
          label={strings.game.leastPenalties}
          player={leastRaw}
          isLandscape={isLandscape}
          ringMetric="raw"
          rawProgressMax={maxRaw}
        />
      </View>
    </View>
  );
}

type ColumnProps = {
  label: string;
  player: Player | null;
  isLandscape: boolean;
  ringMetric?: 'threshold' | 'raw';
  rawProgressMax?: number;
};

function FooterColumn({ label, player, isLandscape, ringMetric, rawProgressMax }: ColumnProps) {
  return (
    <View style={[styles.column, isLandscape && styles.columnLandscape]}>
      <Text variant="labelSM" color={colors.textMuted} style={styles.columnLabel}>
        {label.toUpperCase()}
      </Text>
      {player ? (
        <View style={isLandscape ? styles.chipWrap : undefined}>
          <PlayerChip
            player={player}
            size="sm"
            ringMetric={ringMetric}
            rawProgressMax={rawProgressMax}
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: spacing.md,
  },
  rootLandscape: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  statsLandscape: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: FOOTER_LANDSCAPE_MAX_WIDTH,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  column: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  columnLandscape: {
    alignItems: 'center',
  },
  columnLabel: {
    alignSelf: 'stretch',
    width: '100%',
    textAlign: 'center',
  },
  chipWrap: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
});
