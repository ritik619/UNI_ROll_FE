import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'src/components/snackbar';
import { IStudentsItem } from 'src/types/students';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';

const CONSENT_FORM_STATUS_COLORS = {
  Pending: 'warning',
  Sent: 'success',
} as const;

type Props = {
  student: IStudentsItem;
  onRefresh: () => void;
};

export function StudentConsentFormView({ student, onRefresh }: Props) {
  const [status, setStatus] = useState<'Sent' | 'Pending'>('Pending');
  const [loading, setLoading] = useState(false);

  // Fetch the current status of the consent form when the component mounts
  useEffect(() => {
    const fetchConsentFormStatus = async () => {
      setLoading(true); // Show loading spinner while fetching status
      try {
        const response = await authAxiosInstance.get(`${endpoints.students.status}/${student.id}`);

        // Update the status based on the API response
        if (response.status === 200) {
          setStatus(response.data.status); // Assume response contains a `status` field
        } else {
          toast.error('Failed to fetch consent form status');
        }
      } catch (error) {
        toast.error('An error occurred while fetching the consent form status');
      } finally {
        setLoading(false); // Hide loading spinner after fetching
      }
    };

    fetchConsentFormStatus();
  }, [student.id]); // Run once when the component mounts

  // Handle sending the consent form
  const handleSendConsentForm = async () => {
    setLoading(true); // Set loading to true when starting the API call

    try {
      const response = await authAxiosInstance.post(endpoints.students.status, {
        studentId: student.id,
      });

      if (response.status === 200) {
        setStatus('Sent');
        toast.success('Consent form sent successfully!');
        onRefresh();
      } else {
        toast.error('Failed to send consent form.');
      }
    } catch (error) {
      toast.error('An error occurred while sending the consent form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Card sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            Consent Form
          </Typography>

          {loading ? (
            <CircularProgress size={24} color="inherit" /> // Show spinner while fetching or sending
          ) : (
            <Button
              variant="outlined"
              component="span"
              color={CONSENT_FORM_STATUS_COLORS[status]}
              onClick={handleSendConsentForm} // Trigger API call when button is clicked
              disabled={status === 'Sent'} // Disable button if the form is already sent
            >
              {status === 'Sent' ? 'Sent' : 'Send'}
            </Button>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
