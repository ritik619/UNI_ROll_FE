import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'minimal-shared/hooks';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { toast } from 'src/components/snackbar';

import type { IStudentsItem } from 'src/types/students';
import { uploadFileAndGetURL } from 'src/auth/context';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';

// ----------------------------------------------------------------------

type Props = {
  student: IStudentsItem;
  onRefresh: () => void;
};

const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function StudentDocumentsView({ student, onRefresh }: Props) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const confirmDialog = useBoolean();

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      // TODO: Implement document deletion
      // await deleteDocument(selectedDocument);
      onRefresh();
      confirmDialog.onFalse();
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const validateFile = (file: File): string | null => {
    if (!file) return 'No file selected';

    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return 'Invalid file type. Please upload a PDF, Word document, or image (JPG, PNG, GIF, WEBP)';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit';
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setIsUploading(true);

      if (documentType === 'otherDocuments') {
        // Handle multiple files for other documents
        const uploadPromises = Array.from(files).map(async (file) => {
          const error = validateFile(file);
          if (error) {
            toast.error(error);
            return null;
          }

          const fileName = `${file.name}.${file.name.split('.').pop()}`;
          return uploadFileAndGetURL(file, `students/${student.id}/documents/other/${fileName}`);
        });

        const urls = (await Promise.all(uploadPromises)).filter(Boolean);

        if (urls.length) {
          // Get existing other documents or initialize empty array
          const existingDocs = student.documents?.otherDocuments || [];

          // Update the documents array with new URLs
          await authAxiosInstance.patch(endpoints.students.details(student.id), {
            documents: {
              ...student.documents,
              otherDocuments: [...existingDocs, ...urls]
            },
          });

          toast.success(`${urls.length} document(s) uploaded successfully`);
          onRefresh();
        }
      } else {
        // Handle single file for specific document types
        const file = files[0];
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          return;
        }

        const fileName = `${file.name}.${file.name.split('.').pop()}`;
        const url = await uploadFileAndGetURL(file, `students/${student.id}/documents/${fileName}`);

        await authAxiosInstance.patch(endpoints.students.details(student.id), {
          documents: { ...student.documents, [documentType]: url },
        });

        toast.success('Document uploaded successfully');
        onRefresh();
      }
    } catch (error) {
      console.error('Error uploading document(s):', error);
      toast.error('Failed to upload document(s)');
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
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
            <Box component="label">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => handleFileSelect(e, title.toLowerCase())}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={isUploading ? <CircularProgress size={20} /> : <Iconify icon="mdi:upload" />}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
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
            <Box component="label">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => handleFileSelect(e, 'otherDocuments')}
                style={{ display: 'none' }}
                disabled={isUploading}
                multiple
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={isUploading ? <CircularProgress size={20} /> : <Iconify icon="mdi:upload" />}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Box>
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