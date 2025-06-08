import { CONFIG } from 'src/global-config';

import { EarningView } from 'src/sections/Earning/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Earnings Overview | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <EarningView />;
}
