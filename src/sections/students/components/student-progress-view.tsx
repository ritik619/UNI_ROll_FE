import { useState } from 'react';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { toast } from 'src/components/snackbar';
import { Box, Card, Typography, MenuItem, Select, FormControl, Button } from '@mui/material';
import { IStudentsItem } from 'src/types/students';

// ----------------------------------------------------------------------

type Props = {
  student: IStudentsItem;
  status: 'Enrolled' | 'Withdrawn' | 'Deferred' | 'UnEnrolled'; // Add status as a prop
  onRefresh: () => void;
};

const STATUS_COLORS = {
  Enrolled: 'success',
  Withdrawn: 'error',
  Deferred: 'warning',
} as const;

export function StudentProgressView({ student, status, onRefresh }: Props) {
  const [currentStatus, setCurrentStatus] = useState<'Enrolled' | 'Withdrawn' | 'Deferred'>(status);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setLoading(true);

    const data = {
      studentId: student.id,
      status: currentStatus,
    };

    try {
      const response = await authAxiosInstance.patch(
        `${endpoints.students.status}/${student.id}`,
        data
      );

      if (response.status === 200) {
        toast.success('Status updated successfully!');
        onRefresh(); // Optionally refresh the data after the update
      } else {
        toast.error('Failed to update the status');
      }
    } catch (error) {
      toast.error('Failed to update status');
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
        Status
      </Typography>
      <FormControl fullWidth sx={{ paddingX: '10px' }}>
        <Select
          value={currentStatus}
          onChange={(e) => {
            const value = e.target.value as 'Enrolled' | 'Withdrawn' | 'Deferred';
            setCurrentStatus(value);
          }}
        >
          <MenuItem value="Enrolled">Enrolled</MenuItem>
          <MenuItem value="Withdrawn">Withdrawn</MenuItem>
          <MenuItem value="Deferred">Deferred</MenuItem>
        </Select>
      </FormControl>

      <Box mt={2} sx={{ padding: '10px' }}>
        <Button
          onClick={handleStatusUpdate}
          variant="contained"
          color={STATUS_COLORS[currentStatus]}
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Updating...' : `Update Status to ${currentStatus}`}
        </Button>
      </Box>
    </Card>
  );
}
