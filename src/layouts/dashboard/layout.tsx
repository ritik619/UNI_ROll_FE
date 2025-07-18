'use client';

import type { Breakpoint } from '@mui/material/styles';
import type { NavItemDataProps, NavSectionProps } from 'src/components/nav-section';

import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { _contacts, _notifications } from 'src/_mock';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/auth/hooks';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { layoutClasses } from '../core/classes';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../nav-config-account';
import { MainSection } from '../core/main-section';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import { LanguagePopover } from '../components/language-popover';
import { ContactsPopover } from '../components/contacts-popover';
import { WorkspacesPopover } from '../components/workspaces-popover';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { NotificationsDrawer } from '../components/notifications-drawer';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

function filterNavByUser(
  navData: {
    subheader?: string;
    roles?: string[];
    items: NavItemDataProps[];
  }[],
  user: { role?: string; showUniversities?: boolean; showIntakes?: boolean; isReferral?: boolean }
) {
  const isAdmin = user?.role === 'admin';
  const isReferral = user?.isReferral || false;

  return navData
    .filter((section) => {
      // Admin sees everything
      if (isAdmin) return !section.roles || section.roles.includes('admin');

      // Agents see only sections where roles include 'agent' or no roles
      return !section.roles || section.roles.includes('agent');
    })
    .map((section) => {
      const filteredItems = section.items
        .filter((item) => {
          if (isAdmin) return true;

          // Agents: check item roles
          if (!item.roles) return true;
          if (item.roles.includes('agent')) return true;
          if (item.roles.includes('showUniversities') && user?.showUniversities) return true;
          if (item.roles.includes('showIntakes') && user?.showIntakes) return true;
          if (item.roles.includes('showEarningsOverview') && !isReferral) return true;
          return false;
        })
        .map((item) => {
          const filteredChildren = item.children?.filter((child) => {
            if (isAdmin) return true;

            if (!child.roles) return true;
            if (child.roles.includes('agent')) return true;
            if (child.roles.includes('showUniversities') && user?.showUniversities) return true;
            if (child.roles.includes('showIntakes') && user?.showIntakes) return true;
            if (child.roles.includes('showEarningsOverview') && !isReferral) return true;
            return false;
          });
          item.roles = user?.role === 'admin' ? ['admin'] : ['agent'];
          return {
            ...item,
            ...(filteredChildren ? { children: filteredChildren } : {}),
          };
        });

      return {
        ...section,
        roles:
          user?.role === 'admin'
            ? ['admin']
            : ['agent', 'showUniversities', 'showIntakes', 'showEarningsOverview'],
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0); // Remove sections with no visible items
}

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const navData = filterNavByUser(
    slotProps?.nav?.data ?? dashboardNavData,
    user as {
      role: 'admin' | 'agent';
      showUniversities?: boolean;
      showIntakes?: boolean;
      showEarningsOverview?: boolean;
      isReferral?: boolean;
    }
  );
  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      bottomArea: isNavHorizontal ? (
        <NavHorizontal
          data={navData}
          layoutQuery={layoutQuery}
          cssVars={navVars.section}
          currentRole={user?.role ?? 'user'}
        />
      ) : null,
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
            currentRole={user?.role ?? 'user'}
          />

          {/** @slot Logo */}
          {isNavHorizontal && (
            <Logo
              isSingle={false}
              sx={{
                display: 'none',
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              }}
            />
          )}

          {/** @slot Divider */}
          {isNavHorizontal && (
            <VerticalDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }} />
          )}
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Account drawer */}
          <AccountDrawer data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      currentRole={user?.role ?? 'user'}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
