import { MODAL_ALL_ORIENTATIONS } from '@ui/components/modalDefaults';

describe('MODAL_ALL_ORIENTATIONS', () => {
  it('includes every supported orientation variant', () => {
    expect(MODAL_ALL_ORIENTATIONS).toEqual([
      'portrait',
      'portrait-upside-down',
      'landscape',
      'landscape-left',
      'landscape-right',
    ]);
  });
});
