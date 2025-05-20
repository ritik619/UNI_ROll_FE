import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import UniversityCreateView from 'src/sections/universities/view/university-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create a new University | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <UniversityCreateView />;
}
