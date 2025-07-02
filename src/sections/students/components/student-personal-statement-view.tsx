import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  FormControl,
  TextField,
  Button,
} from '@mui/material';
import { toast } from 'src/components/snackbar';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import { saveAs } from 'file-saver';
import { IStudentsItem } from 'src/types/students';
import { Iconify } from 'src/components/iconify';
import { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer } from 'docx';

type Props = {
  student: IStudentsItem;
  onRefresh?: () => void;
};

export function StudentPersonalStatementView({ student, onRefresh }: Props) {
  const [personalStatement, setPersonalStatement] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setPersonalStatement(student?.personalStatement || '');
  }, [student?.personalStatement]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {

      const { data } = await authAxiosInstance.post(
        endpoints.students.aiAssistStatement(student.id),
        { personalStatement }
      );

      if (data?.personalStatement) {
        setPersonalStatement(data.personalStatement);
        toast.success('Generated successfully');

        // await authAxiosInstance.patch(endpoints.students.details(student.id), {
        //   personalStatement: data.personalStatement,
        // });

      } else {
        toast.error('No personal statement returned');
      }
    } catch (error) {
      console.error(error);
      toast.error('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {

      await authAxiosInstance.patch(endpoints.students.details(student.id), {
        personalStatement,
      });

      toast.success('Saved successfully');
      onRefresh?.();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    const fileName = `${student?.firstName || 'student'}_${student?.lastName || ''}_personal_statement.docx`;
    try {
      const paragraphTexts = personalStatement
        .split(/\n{2,}/) // better paragraph splitting
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const header = new Header({
        children: [
          new Paragraph({
            text: 'Personal Statement',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
        ],
      });

      const body = paragraphTexts.map(
        (text) =>
          new Paragraph({
            children: [
              new TextRun({
                text,
                font: 'Arial',
                size: 16, // 12pt
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              after: 200,
              line: 360,
            },
          })
      );

      const footer = new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Confidential – ${student.firstName} ${student.lastName}`,
                italics: true,
                size: 18,
                font: 'Arial',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      });

      const doc = new Document({
        sections: [
          {
            headers: { default: header },
            footers: { default: footer },
            children: body,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download personal statement');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h6" gutterBottom>
        Personal Statement
      </Typography>
      {/* TextField */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <TextField
          label="Personal Statement"
          multiline
          minRows={6}
          value={personalStatement}
          onChange={(e) => setPersonalStatement(e.target.value)}
        />
      </FormControl>
      {/* Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Iconify icon="carbon:ai-generate" />}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate'}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={handleSave}
          disabled={saving || !personalStatement.trim()}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<Iconify icon="mdi:download" />}
          onClick={handleDownload}
          disabled={!personalStatement.trim() || downloading}
        >
          {downloading ? 'Downloading...' : 'Download'}
        </Button>
      </Stack>
    </Card>
  );
};