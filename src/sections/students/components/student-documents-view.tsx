import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'minimal-shared/hooks';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import type { IStudentsItem } from 'src/types/students';

// ----------------------------------------------------------------------

type Props = {
  student: IStudentsItem;
  onRefresh: () => void;
};

export function StudentDocumentsView({ student, onRefresh }: Props) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const confirmDialog = useBoolean();

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      // TODO: Implement document deletion
      // await deleteDocument(selectedDocument);
      onRefresh();
      confirmDialog.onFalse();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const renderDocumentItem = (title: string, url?: string) => {
    if (!url) {
      return (
        <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="mdi:file-pdf-box" width={24} />
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="mdi:upload" />}
              onClick={() => {
                // TODO: Implement document upload
                console.log('Upload clicked for:', title);
              }}
            >
              Upload
            </Button>
          </Stack>
        </Card>
      );
    }

    return (
      <Card sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon="mdi:file-pdf-box" width={24} />
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              component="a"
              href={url}
              target="_blank"
              rel="noopener"
              variant="outlined"
              startIcon={<Iconify icon="mdi:download" />}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="mdi:delete" />}
              onClick={() => {
                setSelectedDocument(url);
                confirmDialog.onTrue();
              }}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Card>
    );
  };

  return (
    <>
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Required Documents
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Passport</Typography>
                {renderDocumentItem('Passport', student.documents?.passport)}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Share Code</Typography>
                {renderDocumentItem('Share Code', student.documents?.shareCode)}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Proof of Address</Typography>
                {renderDocumentItem('Proof of Address', student.documents?.proofOfAddress)}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Diploma</Typography>
                {renderDocumentItem('Diploma', student.documents?.diploma)}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Personal Statement</Typography>
                {renderDocumentItem('Personal Statement', student.documents?.personalStatement)}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>CV</Typography>
                {renderDocumentItem('CV', student.documents?.cv)}
              </Box>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">Other Documents</Typography>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="mdi:upload" />}
              onClick={() => {
                // TODO: Implement other documents upload
                console.log('Upload other document clicked');
              }}
            >
              Upload Document
            </Button>
          </Stack>

          <Stack spacing={2}>
            {student.documents?.otherDocuments?.map((doc, index) => (
              <Card key={index} sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Iconify icon="mdi:file-pdf-box" width={24} />
                  <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                    Other Document {index + 1}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component="a"
                      href={doc}
                      target="_blank"
                      rel="noopener"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:download" />}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Iconify icon="mdi:delete" />}
                      onClick={() => {
                        setSelectedDocument(doc);
                        confirmDialog.onTrue();
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      </Stack>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content="Are you sure you want to delete this document?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteDocument}>
            Delete
          </Button>
        }
      />
    </>
  );
} 