import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { BlankView } from 'src/sections/blank/view';

// import { AccountBillingView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account billing settings | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <BlankView />;
}
