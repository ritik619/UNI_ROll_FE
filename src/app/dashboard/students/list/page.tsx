import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StudentListView } from 'src/sections/student/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <StudentListView />;
}
