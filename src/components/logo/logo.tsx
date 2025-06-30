import type { LinkProps } from '@mui/material/Link';
import { forwardRef, useId } from 'react';
import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';
import { mergeClasses } from 'minimal-shared/utils';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/global-config';
import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export const Logo = forwardRef<HTMLAnchorElement, LogoProps>((props, ref) => {
  const { className, href = '/', isSingle = true, disabled, sx, ...other } = props;

  const theme = useTheme();
  const gradientId = useId();

  const singleLogo = (
    <img
      alt="Single logo"
      src={`${CONFIG.assetsDir}/logo/e-logo.png`}
      width="100%"
      height="100%"
      style={{ objectFit: 'contain' }}
    />
  );

  const fullLogo = (
    <img
      alt="Full logo"
      src={`${CONFIG.assetsDir}/logo/full-logo.png`}
      width="150%"
      height="100%"
      style={{ objectFit: 'fill' }}
    />
  );

  return (
    <LogoRoot
      ref={ref}
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: isSingle ? 50 : 180,
          height: isSingle ? 50 : 50,
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
});

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
