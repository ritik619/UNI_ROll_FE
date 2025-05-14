import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    agent: {
      root: `${ROOTS.DASHBOARD}/agent`,
      new: `${ROOTS.DASHBOARD}/agent/new`,
      list: `${ROOTS.DASHBOARD}/agent/list`,
      cards: `${ROOTS.DASHBOARD}/agent/cards`,
      profile: `${ROOTS.DASHBOARD}/agent/profile`,
      // account: `${ROOTS.DASHBOARD}/agent/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/agent/${id}/edit`,
    },

    students: `${ROOTS.DASHBOARD}/students`,
    universitiesAndCourses: {
      root: `${ROOTS.DASHBOARD}/universities-&-courses/list`,
      list: `${ROOTS.DASHBOARD}/universities-&-courses/list`,
      new: `${ROOTS.DASHBOARD}/universities-&-courses/new`,
      addCourse: `${ROOTS.DASHBOARD}/universities-&-courses/add-course`,
      editCourse: (id: string) => `${ROOTS.DASHBOARD}/universities-&-courses/edit-course/${id}`,
      universityCourses: (id: string) => `${ROOTS.DASHBOARD}/universities-&-courses/university/${id}`,
    },
    intakes: `${ROOTS.DASHBOARD}/intakes`,
    earningsoverview: `${ROOTS.DASHBOARD}/earnings-overview`,
  },
};
