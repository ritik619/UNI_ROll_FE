import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import IntakeEditView from 'src/sections/intake/view/intake-edit-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit Intake | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return <IntakeEditView intakeId={params.id} />;
}