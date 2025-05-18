import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { _userList } from 'src/_mock/_user';

import { StudentsEditView } from 'src/sections/students/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Students edit | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  const { id } = params;

  const currentStudents = _userList.find((students) => students.id === id);

  return <StudentsEditView students={currentStudents} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 * Will remove in Next.js v15
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';
export { dynamic };

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    return _userList.map((students) => ({ id: students.id }));
  }
  return [];
}
