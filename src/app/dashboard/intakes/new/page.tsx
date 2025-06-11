import { CONFIG } from 'src/global-config';
import IntakeCreateView from 'src/sections/intake/view/intake-create-view';

import { IntakeNewEditForm } from 'src/sections/intake/view/intake-new-edit-form';

// ----------------------------------------------------------------------

export const metadata = { title: `Intakes | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <IntakeCreateView />;
}
