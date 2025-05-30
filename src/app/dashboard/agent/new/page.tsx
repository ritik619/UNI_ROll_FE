
import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AgentCreateView } from 'src/sections/agent/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create a new agent | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AgentCreateView />;
}
