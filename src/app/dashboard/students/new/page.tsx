import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UserCreateView } from 'src/sections/student/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create a Student | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <UserCreateView />;
}
