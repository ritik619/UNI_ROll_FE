import { useState } from 'react';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { toast } from 'src/components/snackbar';
import { Box, Card, Stack, Typography, MenuItem, Select, FormControl, Button } from '@mui/material';
import { IStudentsItem } from 'src/types/students';

// ----------------------------------------------------------------------

type Props = {
  student: IStudentsItem;
  finance: 'Applied' | 'Approved'; // Finance status prop
  onRefresh: () => void;
};

const FINANCE_STATUS_COLORS = {
  Applied: 'info',
  Approved: 'success',
} as const;

export function StudentFinanceView({ student, finance, onRefresh }: Props) {
  const [currentFinance, setCurrentFinance] = useState<'Applied' | 'Approved'>(finance);
  const [loading, setLoading] = useState(false);

  const handleFinanceStatusUpdate = async () => {
    setLoading(true);

    const data = {
      studentId: student.id,
      finance: currentFinance,
    };

    try {
      const response = await authAxiosInstance.patch(
        `${endpoints.students.finance}/${student.id}`,
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
      <FormControl fullWidth sx={{ paddingX: '10px' }}>
        <Select
          value={currentFinance}
          onChange={(e) => {
            const value = e.target.value as 'Applied' | 'Approved'; // Type assertion
            setCurrentFinance(value);
          }}
        >
          <MenuItem value="Applied">Applied</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
        </Select>
      </FormControl>

      <Box mt={2} sx={{ padding: '10px' }}>
        <Button
          onClick={handleFinanceStatusUpdate}
          variant="contained"
          color={FINANCE_STATUS_COLORS[currentFinance]}
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Updating...' : `Update Finance Status to ${currentFinance}`}
        </Button>
      </Box>
    </Card>
  );
}
