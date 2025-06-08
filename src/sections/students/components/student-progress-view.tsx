import { useState } from 'react';

import {
  Box,
  Card,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';

import { IStudentsItem } from 'src/types/students';

// ----------------------------------------------------------------------

type Props = {
  student: IStudentsItem;
  onRefresh: () => void;
};

const STATUS_COLORS = {
  Enrolled: 'success',
  Withdrawn: 'error',
  Deferred: 'warning',
} as const;

export function StudentProgressView({ student, onRefresh }: Props) {
  const [status, setStatus] = useState<'Enrolled' | 'Withdrawn' | 'Deferred'>('Enrolled');

  const handleChange = (event: any) => {
    setStatus(event.target.value);
  };

  return (
    <Card
      sx={{
        width: '100%',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ padding: '10px' }}>
        Status
      </Typography>
      <FormControl fullWidth sx={{ paddingX: '10px' }}>
        <Select value={status} onChange={handleChange}>
          <MenuItem value="Enrolled">Enrolled</MenuItem>
          <MenuItem value="Withdrawn">Withdrawn</MenuItem>
          <MenuItem value="Deferred">Deferred</MenuItem>
        </Select>
      </FormControl>

      <Box mt={2} sx={{ padding: '10px' }}>
        <Chip
          label={status}
          color={STATUS_COLORS[status]}
          variant="filled"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
    </Card>
  );
}
