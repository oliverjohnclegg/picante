import { LayoutAnimation } from 'react-native';

export const CARD_ASPECT = 320 / 220;
export const HOLD_FOR_SETTINGS_MS = 650;

export const CARD_BASE_WIDTH_PORTRAIT = 140;
export const CARD_BASE_WIDTH_LANDSCAPE = 200;
export const LANDSCAPE_FORFEIT_MIN_W = 260;
export const LANDSCAPE_FORFEIT_MAX_W = 420;
export const LANDSCAPE_FORFEIT_WIDTH_RATIO = 0.34;
export const CONTINUE_MAX_WIDTH = 320;
export const FOOTER_LANDSCAPE_MAX_WIDTH = 720;

export const DRAW_ANIM = {
  slide: 420,
  reveal: 320,
  panelDelay: 260,
  panelDuration: 340,
  continueDuration: 280,
  continueDelayOffset: 80,
  deckFade: 240,
  deckRevealDelay: 140,
  holdFadeIn: 160,
  holdFadeOut: 220,
} as const;

export const LAYOUT_TRANSITION = {
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
