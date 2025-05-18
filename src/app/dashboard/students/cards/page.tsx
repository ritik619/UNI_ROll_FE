import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StudentsCardsView } from 'src/sections/students/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Students cards | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <StudentsCardsView />;
}
