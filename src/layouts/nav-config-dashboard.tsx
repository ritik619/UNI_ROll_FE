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
    subheader: 'Management Portal',
    roles: ['admin'],
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
      {
        title: 'Agents',
        path: paths.dashboard.agent.list,
        icon: ICONS.agent,
        children: [
          // { title: 'Profile', path: paths.dashboard.agent.root },
          { title: 'Add Agent', path: paths.dashboard.agent.new },
          { title: 'Agents List', path: paths.dashboard.agent.list },
          // { title: 'Cards', path: paths.dashboard.agent.cards },
          // { title: 'Edit', path: paths.dashboard.agent.demo.edit },
          // { title: 'Account', path: paths.dashboard.agent.account },
        ],
      },
      {
        title: 'Students',
        path: paths.dashboard.students.root,
        icon: ICONS.booking,
        children: [
          // { title: 'Profile', path: paths.dashboard.students.root },
          // { title: 'Add Student', path: paths.dashboard.students.new },
          { title: 'Students List', path: paths.dashboard.students.list },
          // { title: 'Cards', path: paths.dashboard.students.cards },
          // { title: 'Edit', path: paths.dashboard.students.demo.edit },
          // { title: 'Account', path: paths.dashboard.students.account },
        ],
      },
      {
        title: 'Universities & Courses',
        path: paths.dashboard.universitiesAndCourses.listUniversities,
        icon: ICONS.course,
        children: [
          {
            title: 'Add University',
            path: paths.dashboard.universitiesAndCourses.addUniversity,
          },
          {
            title: 'Universities List',
            path: paths.dashboard.universitiesAndCourses.listUniversities,
          },
          {
            title: 'Add Course',
            path: paths.dashboard.universitiesAndCourses.addCourse,
          },
          { title: 'Courses List', path: paths.dashboard.universitiesAndCourses.listCourses },
        ],
      },
      {
        title: 'Intakes',
        path: paths.dashboard.intakes.root,
        icon: ICONS.calendar,
        children: [
          {
            title: 'Add Intake',
            path: paths.dashboard.intakes.new,
          },
          {
            title: 'Intakes List',
            path: paths.dashboard.intakes.root,
          },
        ],
      },
      {
        title: 'Earnings OverView',
        path: paths.dashboard.earningsoverview,
        icon: ICONS.banking,
      },
    ],
  },
  {
    subheader: 'Agent Portal',
    roles: ['agent'],
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
      {
        title: 'Students',
        path: paths.dashboard.students.root,
        icon: ICONS.booking,
        children: [
          { title: 'Add Student', path: paths.dashboard.students.new },
          { title: 'Students List', path: paths.dashboard.students.list },
        ],
      },
      {
        title: 'Universities & Courses',
        path: paths.dashboard.universitiesAndCourses.listUniversities,
        icon: ICONS.course,
        roles: ['showUniversities'],
        children: [
          {
            title: 'Universities List',
            path: paths.dashboard.universitiesAndCourses.listUniversities,
          },
          { title: 'Courses List', path: paths.dashboard.universitiesAndCourses.listCourses },
        ],
      },
      {
        title: 'Intakes',
        path: paths.dashboard.intakes.root,
        icon: ICONS.calendar,
        roles: ['showIntakes'],
        children: [
          {
            title: 'Intakes List',
            path: paths.dashboard.intakes.root,
          },
        ],
      },
      {
        title: 'Earnings OverView',
        path: paths.dashboard.earningsoverview,
        icon: ICONS.banking,
      },
    ],
  },
];
