import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Button,
  useTheme,
} from '@mui/material';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { toast } from 'src/components/snackbar';
import { IStudentsItem, IStudentStatus } from 'src/types/students';

type Props = {
  student: IStudentsItem;
  status: IStudentStatus;
  onRefresh: () => void;
};

const STATUS_COLORS: Record<IStudentStatus, string> = {
  Enrolled: 'green',
  Deferred: '#DAA520',
  Withdrawn: 'red',
  // Unaffiliated: 'red',
  // UnEnrolled: 'error',
  // All: 'success',
};

export function StudentProgressView({ student, status, onRefresh }: Props) {
  const [currentStatus, setCurrentStatus] = useState<IStudentStatus>(status);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const statusColor = STATUS_COLORS[currentStatus];
  // const statusColorMain = theme.palette[statusColor].main;

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const response = await authAxiosInstance.patch(endpoints.students.details(student.id), {
        status: currentStatus,
      });

      if (response.status === 200) {
        toast.success('Status updated successfully!');
        onRefresh();
      } else {
        toast.error('Failed to update the status');
      }
    } catch (e) {
      toast.error('Failed to update status' + e?.message);
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
      <Typography variant="h5" gutterBottom sx={{ padding: '10px' }}>
        Progress Status
      </Typography>

      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} sx={{ p: 2, m: 2 }} gap={2}>
        {student?.universityId ? (<><FormControl sx={{ width: '70%' }}>
          <Select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value as IStudentStatus)}
            sx={{ background: theme.palette.background.paper }}
            // sx={{
            //   '.MuiOutlinedInput-notchedOutline': { borderColor: statusColorMain },
            //   '.MuiSelect-select': { color: statusColorMain, textAlign: 'center' },
            //   '.MuiSelect-icon': { color: statusColorMain },
            // }}
          >
            {Object.keys(STATUS_COLORS).map((statusKey) => (
              <MenuItem
                key={statusKey}
                value={statusKey}
                sx={{
                  justifyContent: 'center',
                  color: STATUS_COLORS[statusKey],
                  border: `2px ${STATUS_COLORS[statusKey]} solid`,
                  background: theme.palette.background.paper,
                }}
                color={STATUS_COLORS[currentStatus]}
              >
                {statusKey}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="soft"
          // color={statusColor}
          onClick={handleStatusUpdate}
          disabled={loading}
          sx={{ width: '30%' }}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button></>) :
          <Typography variant="h6" gutterBottom sx={{ padding: '10px' }}>
            Student needs to be enrolled to access this section.
          </Typography>
        }
      </Box>
    </Card>
  );
}
