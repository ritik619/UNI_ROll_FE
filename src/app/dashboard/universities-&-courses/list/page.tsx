import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UniversitytListView } from 'src/sections/universities/view/agent-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Universities list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <UniversitytListView />;
}
