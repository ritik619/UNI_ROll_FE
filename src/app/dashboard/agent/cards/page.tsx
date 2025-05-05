import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AgentCardsView } from 'src/sections/agent/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User cards | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AgentCardsView />;
}
