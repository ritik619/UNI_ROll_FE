import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
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
              otherDocuments: [...existingDocs, ...urls],
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

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();
      const documents = student.documents || {};

      // Add each document to the zip
      for (const [docType, url] of Object.entries(documents)) {
        if (url) {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            const fileName = url.split('/').pop() || `${docType}.pdf`;
            zip.file(fileName, blob);
          } catch (error) {
            console.error(`Error downloading ${docType}:`, error);
          }
        }
      }

      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${student.firstName}_${student.lastName}_documents.zip`);

      toast.success('Documents downloaded successfully!');
    } catch (error) {
      console.error('Error creating zip:', error);
      toast.error('Failed to download documents');
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Update the student's documents to remove all documents
      await authAxiosInstance.patch(endpoints.students.details(student.id), {
        documents: {},
      });

      toast.success('All documents deleted successfully');
      onRefresh();
      confirmDialog.onFalse();
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast.error('Failed to delete documents');
    }
  };

  const renderDocumentItem = (title: string, key: string, url?: string) => {
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
                onChange={(e) => handleFileSelect(e, key)}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              <Button
                variant="outlined"
                color="primary"
                component="span"
                startIcon={
                  isUploading ? (
                    <CircularProgress size={20} color="warning" />
                  ) : (
                    <Iconify icon="mdi:upload" />
                  )
                }
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
              aria-label="Download"
              color="success"
            >
              <Iconify icon="mdi:download" />
            </Button>

            <Button
              color="error"
              onClick={() => {
                setSelectedDocument(url);
                confirmDialog.onTrue();
              }}
              aria-label="Delete"
            >
              <Iconify icon="mdi:delete" />
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6">Required Documents</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<Iconify icon="mdi:download" />}
                onClick={handleDownloadAll}
                disabled={!student.documents || Object.keys(student.documents).length === 0}
              >
                Download All
              </Button>
              <Button
                variant="outlined"
                color="error"
                aria-label="Delete All"
                startIcon={<Iconify icon="mdi:delete" />}
                onClick={() => {
                  setSelectedDocument('all');
                  confirmDialog.onTrue();
                }}
                disabled={!student.documents || Object.keys(student.documents).length === 0}
              >
                Delete All
              </Button>
            </Stack>
          </Stack>
          <Grid container spacing={3}>
            {[
              ['Passport', 'passport', student.documents?.passport],
              ['Share Code', 'shareCode', student.documents?.shareCode],
              ['Proof of Address', 'proofOfAddress', student.documents?.proofOfAddress],
              ['Diploma', 'diploma', student.documents?.diploma],
              ['Personal Statement', 'personalStatement', student.documents?.personalStatement],
              ['CV', 'cv', student.documents?.cv],
            ].map(([label, key, url]) => (
              <Grid item xs={12} md={4} key={key as string}>
                {renderDocumentItem(label as string, key as string, url as string | undefined)}
              </Grid>
            ))}
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
                color="primary"
                component="span"
                startIcon={
                  isUploading ? <CircularProgress size={20} /> : <Iconify icon="mdi:upload" />
                }
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
                      aria-label="Download"
                      color="success"
                    >
                      <Iconify icon="mdi:download" />
                    </Button>

                    <Button
                      color="error"
                      onClick={() => {
                        setSelectedDocument(doc);
                        confirmDialog.onTrue();
                      }}
                      aria-label="Delete"
                    >
                      <Iconify icon="mdi:delete" />
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
        title="Delete Document"
        content={
          selectedDocument === 'all'
            ? 'Are you sure you want to delete all documents? This action cannot be undone.'
            : 'Are you sure you want to delete this document? This action cannot be undone.'
        }
        action={
          <Button
            variant="outlined"
            color="error"
            onClick={selectedDocument === 'all' ? handleDeleteAll : handleDeleteDocument}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
