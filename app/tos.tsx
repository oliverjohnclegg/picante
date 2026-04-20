import LegalScreen from '@ui/components/LegalScreen';
import { TOS_SECTIONS } from '@content/legal';
import { strings } from '@i18n/en';

export default function TosScreen() {
  return <LegalScreen title={strings.legal.tosTitle} sections={TOS_SECTIONS} />;
}
