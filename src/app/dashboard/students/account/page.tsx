import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

// import { AccountGeneralView } from 'src/sections/account/view';
import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account general settings | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <BlankView />;
}
