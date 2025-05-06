import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

// import { AccountBillingView } from 'src/sections/account/view';
import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account billing settings | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <BlankView />;
}
