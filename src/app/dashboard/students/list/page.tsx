import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StudentsListView } from 'src/sections/students/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Students list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <StudentsListView />;
}
