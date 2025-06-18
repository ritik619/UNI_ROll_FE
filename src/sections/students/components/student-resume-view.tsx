import { useState } from 'react';
import { Box, Card, Stack, Button, Typography, CircularProgress, Divider } from '@mui/material';
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
    return `You are a professional resume writer. Using the student information provided below, write or craft a clean, well-structured, one-page resume in plain text format.

  Do not include suggestions, comments, notes, or any markdown or formatting instructions. Only return the final resume text. Do not include any headings like "Generated Resume".

  Do not include the Full Name and Contact Information section — it will be added manually.

  Ensure the following **exact sections**, in this order:

  1. Professional Summary (based on education and career goals)
  2. Work History (Include company name, role, and dates if available)
  3. Skills (at least 4 relevant skills)
  4. Education
  5. Languages
  6. Additional Information (e.g., nationality, date of birth)

  Each section **must start with its title**, and be followed by content on the next line(s). For example:

  Professional Summary
  [Your paragraph]

  Work History
  [Job Title] – [Company Name]
  [Responsibilities, etc.]

  Student Profile:
  - Full Name: ${student.firstName} ${student.lastName}
  - Date of Birth: ${student.dateOfBirth}
  - Email: ${student.email}
  - Phone: ${student.phoneNumber}
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

    const sectionTitles = [
      'Professional Summary',
      'Work History',
      'Skills',
      'Education',
      'Languages',
      'References',
      'Additional Information',
    ];

    const isSectionTitle = (line: string) =>
      sectionTitles.some((section) => line.toLowerCase().startsWith(section.toLowerCase()));

    const documentChildren: Paragraph[] = [];

    // ✅ Manually add name and contact info at the top
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${student.firstName} ${student.lastName}`,
            bold: true,
            size: 36,
            font: 'Arial',
          }),
        ],
        alignment: 'center',
        spacing: { after: 100 },
      })
    );

    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${student.phoneNumber}  ${student.email}`,
            italics: true,
            size: 24,
            font: 'Arial',
          }),
        ],
        alignment: 'center',
        spacing: { after: 100 },
      })
    );

    if (student.address) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: student.address,
              size: 24,
              font: 'Arial',
            }),
          ],
          alignment: 'center',
          spacing: { after: 300 },
        })
      );
    }

    // 🔄 Process AI-generated lines
    lines.forEach((line) => {
      if (line === '---' || line === '––––') return;

      if (isSectionTitle(line)) {
        // Title
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: false,
                size: 28,
                font: 'Arial',
              }),
            ],
            spacing: { before: 300, after: 150 },
            indent: { left: 300 },
          })
        );

        // Divider
        documentChildren.push(
          new Paragraph({
            border: {
              bottom: {
                color: 'auto',
                space: 1,
                style: 'single',
                size: 6,
              },
            },
            spacing: { after: 150 },
          })
        );
      } else {
        // Normal content
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 300 },
          })
        );
      }
    });

    const doc = new DocxDocument({
      sections: [
        {
          children: documentChildren,
        },
      ],
    });

    const safeName = `${student.firstName}_${student.lastName}`.replace(/[^a-zA-Z0-9_]/g, '');
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${safeName}_Resume.docx`);
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
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  padding: 2,
                  overflowY: 'auto',
                  fontFamily: 'Arial',
                  fontSize: '14px',
                  lineHeight: 1.8,
                }}
              >
                {/* ✅ Manually inserted name + contact */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {`${student.firstName} ${student.lastName}`}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {`${student.phoneNumber}  ${student.email}`}
                  </Typography>
                  {student.address && <Typography variant="body2">{student.address}</Typography>}
                </Box>

                {/* 🔄 AI-generated resume preview */}
                {resumeText.split('\n').map((line, index) => {
                  const trimmed = line.trim();

                  const isSectionTitle = [
                    'Professional Summary',
                    'Work History',
                    'Skills',
                    'Education',
                    'Languages',
                    'References',
                    'Additional Information',
                  ].some((section) => trimmed.toLowerCase().startsWith(section.toLowerCase()));

                  return (
                    <Box key={index} sx={{ mb: 2 }}>
                      {isSectionTitle && (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {trimmed}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                        </>
                      )}
                      {!isSectionTitle && (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {trimmed}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Stack>
        </Card>
      )}
    </Box>
  );
}
