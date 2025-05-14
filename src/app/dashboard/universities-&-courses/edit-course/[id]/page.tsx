import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import CourseEditView from 'src/sections/courses/view/courses-edit-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit Course | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return <CourseEditView courseId={params.id} />;
}