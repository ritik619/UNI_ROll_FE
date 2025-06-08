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
  Sent: 'info',
  Accepted: 'success',
} as const;

type Props = {
  student: IStudentsItem;
  onRefresh: () => void;
};

export function StudentConsentFormView({ student, onRefresh }: Props) {
  const [status, setStatus] = useState<'Sent' | 'Pending' | 'Accepted'>(student?.consent?.signed ? 'Accepted' :student?.consent?.sent ? 'Sent' :  'Pending');
  const [loading, setLoading] = useState(false);
  const [loadingMarkAsAccepted, setLoadingMarkAsAccepted] = useState(false);

  // Handle sending the consent form
  const handleSendConsentForm = async () => {
    setLoading(true); // Set loading to true when starting the API call

    try {
      const response = await authAxiosInstance.patch(endpoints.students.sendConsentForm(student.id), {
        sent: true
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

  const handleMarkAsAccepted = async () => {
    setLoadingMarkAsAccepted(true);
    try {
      const response = await authAxiosInstance.patch(endpoints.students.sendConsentForm(student.id), {
        signed: true
      });
    } catch (error) {
      toast.error('An error occurred while marking the consent form as accepted.');
    } finally {
      setLoadingMarkAsAccepted(false);
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
              disabled={status === 'Accepted'} // Disable button if the form is already sent
            >
              {status === 'Pending' && 'Send' }
              {status==="Sent" && 'Send Again'}
              {status==="Accepted" && 'Accepted'}
            </Button>
          )}
          {status === 'Accepted' ? <></> : loadingMarkAsAccepted ? (
            <CircularProgress size={24} color="inherit" /> // Show spinner while fetching or sending
          ) : (
            <Button
              variant="outlined"
              component="span"
              color={CONSENT_FORM_STATUS_COLORS.Accepted}
              onClick={handleMarkAsAccepted} // Trigger API call when button is clicked
            >
              Mark as Accepted
            </Button>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
