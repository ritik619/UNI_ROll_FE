import { useState } from 'react';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { toast } from 'src/components/snackbar';
import {
  Box,
  Card,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Button,
  useTheme,
} from '@mui/material';
import { IFinanceStatus, IStudentsItem } from 'src/types/students';

// ----------------------------------------------------------------------

type Props = {
  student: IStudentsItem;
  finance: IFinanceStatus; // Finance status prop
  onRefresh: () => void;
};

const STATUS_COLORS = {
  Applied: 'info',
  Approved: 'success',
} as const;

export function StudentFinanceView({ student, finance, onRefresh }: Props) {
  const [currentFinance, setCurrentFinance] = useState<'Applied' | 'Approved'>(finance);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleFinanceStatusUpdate = async () => {
    setLoading(true);

    const data = {
      status: currentFinance,
    };

    try {
      const response = await authAxiosInstance.patch(
        endpoints.students.sendFinanceForm(student.id),
        data
      );

      if (response.status === 200) {
        toast.success('Finance status updated successfully!');
        onRefresh(); // Optionally refresh the data after the update
      } else {
        toast.error('Failed to update finance status');
      }
    } catch (error) {
      toast.error('Failed to update finance status');
    } finally {
      setLoading(false);
    }
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
        Finance Status
      </Typography>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} sx={{ p: 2, m: 2 }} gap={2}>
        <FormControl sx={{ width: '70%' }}>
          <Select
            value={currentFinance}
            onChange={(e) => {
              const value = e.target.value as 'Applied' | 'Approved'; // Type assertion
              setCurrentFinance(value);
            }}
            sx={{ background: theme.palette.background.paper }}
          >
            <MenuItem
              value="Applied"
              sx={{
                justifyContent: 'center',
                color: 'green',
                border: `2px green solid`,
                background: theme.palette.background.paper,
              }}
            >
              Applied
            </MenuItem>
            <MenuItem
              value="Approved"
              sx={{
                justifyContent: 'center',
                color: 'steelblue',
                border: `2px steelblue solid`,
                background: theme.palette.background.paper,
              }}
            >
              Approved
            </MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="soft"
          onClick={handleFinanceStatusUpdate}
          disabled={loading}
          sx={{ width: '30%' }}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </Box>
    </Card>
  );
}
