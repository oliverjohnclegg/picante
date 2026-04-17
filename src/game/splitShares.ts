export type SplitShares = {
  drawerShare: number;
  otherShare: number;
};

export function computeDrawerSplit(total: number): SplitShares {
  const safe = Math.max(0, Math.round(total));
  const drawerShare = Math.ceil(safe / 2);
  const otherShare = safe - drawerShare;
  return { drawerShare, otherShare };
}
