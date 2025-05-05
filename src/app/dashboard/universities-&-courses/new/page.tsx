import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UniversityNewEditForm } from 'src/sections/universities/view/university-new-edit-form';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create a new agent | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <UniversityNewEditForm />;
}
