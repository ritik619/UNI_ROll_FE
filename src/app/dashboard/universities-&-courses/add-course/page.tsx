import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import CourseCreateView from 'src/sections/courses/view/courses-create-view';


// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create a new Course | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <CourseCreateView />;
}
