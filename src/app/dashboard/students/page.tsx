import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StudentsProfileView } from 'src/sections/students/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <StudentsProfileView />;
}
