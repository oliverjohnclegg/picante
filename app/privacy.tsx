import LegalScreen from '@ui/components/LegalScreen';
import { PRIVACY_SECTIONS } from '@content/legal';
import { strings } from '@i18n/en';

export default function PrivacyScreen() {
  return <LegalScreen title={strings.legal.privacyTitle} sections={PRIVACY_SECTIONS} />;
}
