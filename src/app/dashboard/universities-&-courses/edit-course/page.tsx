import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit Course | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  // Redirect to the courses list if no ID is provided
  redirect(paths.dashboard.universitiesAndCourses.list);
}
