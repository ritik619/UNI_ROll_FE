import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StudentsCreateView } from 'src/sections/students/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create a Student | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <StudentsCreateView />;
}
