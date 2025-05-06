import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UniversityListView } from 'src/sections/universities/view/university-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Universities list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <UniversityListView />;
}
