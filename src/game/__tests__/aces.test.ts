import { DRAWER_ACE_SURCHARGE, resolveAce } from '@game/aces';
import type { Player } from '@game/types';

const mkPlayer = (id: string, rawPenalties: number): Player => ({
  id,
  name: id,
  abv: 0.2,
  difficulty: 'tradicional',
  gender: 'man',
  attractedTo: [],
  rawPenalties,
  penaltiesSinceLastShot: 0,
  shotsTaken: 0,
  threshold: 6,
  status: 'active',
});

describe('resolveAce', () => {
  const drawer = mkPlayer('drawer', 30);
  const players: Player[] = [
    drawer,
    mkPlayer('sober1', 0),
    mkPlayer('sober2', 1),
    mkPlayer('middle', 5),
    mkPlayer('loud1', 20),
    mkPlayer('loud2', 10),
  ];

  it('Ace of Spades: three lowest take 15/10/5, drawer +5 (drawer outside target set)', () => {
    const out = resolveAce('spades', drawer, players);
    const lowIds = ['sober1', 'sober2', 'middle'];
    const soberPenalties = out
      .filter((a) => lowIds.includes(a.playerId))
      .map((a) => a.penalties)
      .sort((a, b) => a - b);
    expect(soberPenalties).toEqual([5, 10, 15]);
    const drawerEntry = out.find((a) => a.playerId === 'drawer')!;
    expect(drawerEntry.penalties).toBe(DRAWER_ACE_SURCHARGE);
  });

  it('Ace of Hearts: three highest take 15/10/5, drawer is highest so gets 15+5', () => {
    const out = resolveAce('hearts', drawer, players);
    const drawerEntry = out.find((a) => a.playerId === 'drawer')!;
    expect(drawerEntry.penalties).toBe(15 + DRAWER_ACE_SURCHARGE);
    const loud1 = out.find((a) => a.playerId === 'loud1');
    const loud2 = out.find((a) => a.playerId === 'loud2');
    expect(loud1?.penalties).toBe(10);
    expect(loud2?.penalties).toBe(5);
  });

  it('Ace of Diamonds: lowest takes half the gap (highest=30, lowest=0, half=15)', () => {
    const out = resolveAce('diamonds', drawer, players);
    const lowest = out.find((a) => a.playerId === 'sober1');
    expect(lowest?.penalties).toBe(15);
  });

  it('Ace of Clubs: highest (drawer) takes half the gap + surcharge', () => {
    const out = resolveAce('clubs', drawer, players);
    const drawerEntry = out.find((a) => a.playerId === 'drawer')!;
    expect(drawerEntry.penalties).toBe(15 + DRAWER_ACE_SURCHARGE);
  });

  it('stacks drawer surcharge when drawer is in the target set', () => {
    const drawerOnTop = mkPlayer('drawer', 30);
    const list: Player[] = [drawerOnTop, mkPlayer('a', 0), mkPlayer('b', 5), mkPlayer('c', 10)];
    const out = resolveAce('hearts', drawerOnTop, list);
    const drawerEntry = out.find((a) => a.playerId === 'drawer')!;
    expect(drawerEntry.penalties).toBe(15 + DRAWER_ACE_SURCHARGE);
  });
});
