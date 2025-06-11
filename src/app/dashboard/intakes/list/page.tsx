import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { IntakeListView } from 'src/sections/intake/view/intake-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Universities list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <IntakeListView />;
}
