import { CONFIG } from 'src/global-config';

import { IntakeNewEditForm } from 'src/sections/intake/view/intake-new-edit-form';

// ----------------------------------------------------------------------

export const metadata = { title: `Intakes | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <IntakeNewEditForm />;
}
