import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  agent: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  {
    subheader: 'Management',
    items: [
      {
        title: 'Agent',
        path: paths.dashboard.agent.list,
        icon: ICONS.agent,
        children: [
          // { title: 'Profile', path: paths.dashboard.agent.root },
          { title: 'Add', path: paths.dashboard.agent.new },
          { title: 'List', path: paths.dashboard.agent.list },
          // { title: 'Cards', path: paths.dashboard.agent.cards },
          // { title: 'Edit', path: paths.dashboard.agent.demo.edit },
          // { title: 'Account', path: paths.dashboard.agent.account },
        ],
      },
      {
        title: 'Students',
        path: paths.dashboard.students,
        icon: ICONS.booking,
      },
      {
        title: 'Universities & Courses',
        path: paths.dashboard.universitiesAndCourses.list,
        icon: ICONS.course,
        children: [
          { title: 'List', path: paths.dashboard.universitiesAndCourses.list },
          { title: 'Add', path: paths.dashboard.universitiesAndCourses.new },
        ],
      },
      { title: 'Intakes', path: paths.dashboard.intakes, icon: ICONS.calendar },
      {
        title: 'Earnings OverView',
        path: paths.dashboard.earningsoverview,
        icon: ICONS.banking,
      },
    ],
  },
];
