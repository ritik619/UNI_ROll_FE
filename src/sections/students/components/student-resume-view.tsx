import { useState } from 'react';
import { Box, Card, Stack, Button, Typography, CircularProgress } from '@mui/material';
import { toast } from 'src/components/snackbar';
import { IStudentsItem } from 'src/types/students';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useTheme } from '@mui/material/styles';

export function StudentResumeView({
  student,
  onRefresh,
}: {
  student: IStudentsItem;
  onRefresh: () => void;
}) {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<'NotGenerated' | 'Generated'>('NotGenerated');
  const theme = useTheme();

  const generateResumeTextFromStudent = (student: IStudentsItem): string => {
    return `You are a professional resume writer. Using the information provided below, craft a clean, well-structured, one-page resume in plain text format.

  Do not include any suggestions, comments, or formatting instructions. Only return the final resume content. No markdown or additional explanation.

  The resume should include the following sections:
  1. Full Name and Contact Information
  2. Professional Summary (based on education and career goals)
  3. Education
  4. Skills
  5. Additional Information (e.g., nationality, date of birth)

  Ensure the content fits on a single page and is appropriate for use in a formal job application.
  Student Profile:
  - Full Name: ${student.firstName} ${student.lastName}
  - Date of Birth: ${student.dateOfBirth}
  - Email: ${student.email}
  - Phone: ${student.phonePrefix} ${student.phoneNumber}
  - Nationality: ${student.nationality}
  - Sex: ${student.sex}
  - Address: ${student.address}
  - University: ${student.universityName}
  - Course: ${student.courseName}
  - Current Status: ${student.status}
  `;
  };
  const handleGenerateResume = async () => {
    setLoading(true);
    try {
      const prompt = generateResumeTextFromStudent(student);
      const key = 'vvgzF4u0WV2sVc2rAEOa4vSLzSkCxzaWLvmkdZ6h'; // Add your Cohere API Key

      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          model: 'command-r',
          temperature: 0.4,
        }),
      });

      const data = await response.json();
      const generated = data.text || data.generation || data.message || '';

      if (generated) {
        setResumeText(generated);
        setResumeStatus('Generated');
        toast.success('Resume generated successfully!');
      } else {
        toast.error('Failed to generate resume.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while generating the resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    const lines: string[] = resumeText
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean);

    const doc = new DocxDocument({
      sections: [
        {
          children: lines.map((line: string) => {
            if (line.match(/^[A-Za-z\s]+:$/)) {
              const formattedLine = line
                .replace(':', '')
                .replace(/\b\w/g, (char) => char.toUpperCase());
              return new Paragraph({
                children: [
                  new TextRun({
                    text: formattedLine,
                    bold: true,
                    underline: {},
                    size: 28,
                  }),
                ],
                spacing: { after: 150 },
              });
            }
            return new Paragraph({
              children: [new TextRun({ text: line, font: 'Calibri', size: 24 })],
              spacing: { after: 100 },
            });
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${student.firstName}_${student.lastName}_Resume.docx`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Card sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            Resume
          </Typography>

          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : resumeStatus === 'NotGenerated' ? (
            <Button variant="outlined" onClick={handleGenerateResume} color="info">
              Generate Resume
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={handleGenerateResume} color="warning">
                Update Resume
              </Button>
              <Button variant="contained" color="success" onClick={handleDownloadDocx}>
                Download Resume (DOCX)
              </Button>
            </>
          )}
        </Stack>
      </Card>

      {resumeStatus === 'Generated' && (
        <Card sx={{ p: 2, mt: 2 }}>
          <Stack direction="column" alignItems="start" spacing={2}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {'Preview'}
            </Typography>

            <Card sx={{ p: 2, mt: 2, backgroundColor: theme.palette.background.default }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {resumeText}
              </Typography>
            </Card>
          </Stack>
        </Card>
      )}
    </Box>
  );
}
