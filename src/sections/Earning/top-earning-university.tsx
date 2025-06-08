import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import { orderBy } from 'es-toolkit';

import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type University = {
  universityId: string;
  universityName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
};

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: University[];
  currencyCode: string;
};

export function AppTopUniversityEarnings({ title, subheader, list, currencyCode, sx, ...other }: Props) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box
        sx={{
          p: 3,
          gap: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {orderBy(list, ['totalAmount'], ['desc']).map((item, index) => (
          <Item key={item.universityId} item={item} index={index} currencyCode={currencyCode} />
        ))}
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ItemProps = BoxProps & {
  index: number;
  item: University;
};
function Item({ item, currencyCode, sx, ...other }: ItemProps & { currencyCode: string }) {
  const progress = (item.paidAmount / item.totalAmount) * 100;

  return (
    <Box
      sx={[
        { display: 'flex', flexDirection: 'column', gap: 1.5 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Header: Intake Name + Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ typography: 'subtitle1', fontSize: '1.1rem', fontWeight: '600' }}>
          {item.universityName}
        </Box>
        <Box sx={{ typography: 'caption', color: 'text.secondary', fontSize: '0.9rem' }}>
          {fCurrency(item.paidAmount, { currency: currencyCode })} /{' '}
          {fCurrency(item.totalAmount, { currency: currencyCode })}
        </Box>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: 'divider',
          '& .MuiLinearProgress-bar': {
            bgcolor:
              progress >= 90 ? 'success.main' : progress >= 50 ? 'info.main' : 'warning.main',
          },
        }}
      />

      {/* Paid / Pending Chips */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Chip
          size="small"
          label={`Paid: ${fCurrency(item.paidAmount, { currency: currencyCode })}`}
          sx={{
            fontWeight: 'bold',
            fontSize: '0.9rem',
            bgcolor: 'success.lighter',
            color: 'success.darker',
          }}
        />
        <Chip
          size="small"
          label={`Pending: ${fCurrency(item.pendingAmount, { currency: currencyCode })}`}
          sx={{
            fontWeight: 'bold',
            fontSize: '0.9rem',
            bgcolor: 'warning.lighter',
            color: 'warning.darker',
          }}
        />
      </Box>
    </Box>
  );
}
