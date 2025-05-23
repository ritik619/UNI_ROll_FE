import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AgentListView } from 'src/sections/agent/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AgentListView />;
}
