import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// import { AccountNotificationsView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account notifications settings | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <BlankView />;
}
