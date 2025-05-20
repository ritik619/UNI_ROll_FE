import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { CoursesListView } from 'src/sections/courses/courses-list-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Universities list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <CoursesListView />;
}
