export type LegalSection = {
  heading: string;
  body: string;
};

export const TOS_SECTIONS: LegalSection[] = [
  {
    heading: 'Acceptance',
    body: 'By using Picante you confirm that you are at least 18 years old (or the legal drinking age in your country, whichever is higher) and that you accept these terms in full. If you do not accept them, do not use the app.',
  },
  {
    heading: 'What Picante is',
    body: "Picante is a social party game for adults. It does not dispense alcohol and does not instruct anyone to drink. Shots only occur when a player's own penalty counter crosses a threshold derived from information they themselves entered. The cop-out option on every forfeit is a hard right, not a suggestion.",
  },
  {
    heading: 'Responsibility',
    body: 'You are solely responsible for your own consumption, the consumption of your guests, and any consequences arising from gameplay. Picante is provided for entertainment only. Never drink and drive. Never pressure anyone to drink, perform a forfeit, or reveal anything they do not want to share.',
  },
  {
    heading: 'Consent',
    body: 'Every forfeit in Picante includes an explicit cop-out branch. No player is required to perform any action. Physical forfeits (kisses, risqué messages) are invitations between consenting adults and may always be declined by taking the penalty.',
  },
  {
    heading: 'Content',
    body: 'Diablo mode contains adult themes including references to sex, kinks, and intimacy. It is not suitable for minors under any circumstances. You agree not to play Picante in the presence of anyone under 18.',
  },
  {
    heading: 'Purchases',
    body: 'In-app purchases (e.g. the Diablo unlock) are processed by the App Store or Google Play. Refunds are handled by those platforms in line with their standard policies. Once unlocked, paid content is tied to the store account that made the purchase.',
  },
  {
    heading: 'No warranty',
    body: 'Picante is provided "as is" without any warranty of fitness for a particular purpose. The game\'s suggestions are guidelines, not prescriptions — the group decides what is appropriate. We accept no liability for injury, embarrassment, property damage, or relationship fallout arising from gameplay.',
  },
  {
    heading: 'Changes',
    body: 'These terms may change with future app updates. Substantive changes will be surfaced in-app. Continued use after an update constitutes acceptance of the updated terms.',
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: 'Summary',
    body: 'Picante collects no personal data. No accounts. No analytics. No network calls that involve your data. Everything you enter — player names, ABVs, preferences, game state — lives only on your device.',
  },
  {
    heading: 'What stays on your device',
    body: "Your active session, unlocked packs, audio/haptics settings, and the date of birth you entered at first launch are stored locally using the operating system's standard secure storage. They never leave the device.",
  },
  {
    heading: 'What we never collect',
    body: 'We do not collect email addresses, phone numbers, contacts, photos, location, biometric data, or any other personal identifiers. We do not run behavioural analytics, fingerprinting, or advertising SDKs.',
  },
  {
    heading: 'Crash reports',
    body: 'If you experience a crash, an anonymised stack trace may be sent to our crash-reporting provider (Sentry). These reports contain no personal data — names, ages, gameplay choices are stripped before submission. Crash reporting can be disabled by turning off Diagnostics & Usage sharing in your OS settings.',
  },
  {
    heading: 'Purchases',
    body: 'When you buy Diablo, the purchase is processed directly by the App Store or Google Play. We receive only the receipt token needed to confirm the unlock on your device. We never see your payment details.',
  },
  {
    heading: 'Children',
    body: 'Picante is strictly 18+ and is not directed at anyone under that age. We do not knowingly process data from minors. If a minor has entered a date of birth and you wish to reset the app, simply delete and reinstall it — no data is stored off-device.',
  },
  {
    heading: 'Contact',
    body: 'For privacy questions, contact hello@picante.app.',
  },
];
