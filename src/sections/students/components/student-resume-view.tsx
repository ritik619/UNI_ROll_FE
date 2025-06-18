import { useState } from 'react';
import { Box, Card, Stack, Button, Typography, CircularProgress, Divider, Paper, List, ListItem, ListItemText, ListItemIcon, Grid2 } from '@mui/material';
import { toast } from 'src/components/snackbar';
import { IStudentsItem } from 'src/types/students';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useTheme } from '@mui/material/styles';
import { GridCheckCircleIcon } from '@mui/x-data-grid';

export function StudentResumeView({
  student,
  onRefresh,
}: {
  student: IStudentsItem;
  onRefresh: () => void;
}) {
  const [resumeText, setResumeText] = useState("{\"summary\":\"Highly motivated Btech in CS student with international work experience seeks to leverage strong problem-solving skills and a solution-oriented mindset in the tech industry. Proficient in collaboration and adapting to diverse team dynamics.\\nSkills: Java, Python, HTML5, CSS, JavaScript, SQL, Machine Learning, Data Structures, Algorithms, Software Engineering\\nWork Experiences:\\n\\ndeqode solutions:\\n- Implemented robust solutions for complex business problems\\n- Developed high-quality software by leading a team of 5 engineers\\n- Responsibilities: Agile Methodologies, Software Design, Team Management, Quality Assurance, Client Communication\\n2022–2024\\n\\nFlam:\\n- Designed and developed user-friendly web applications\\n- Collaborated with a dynamic team to create a robust, scalable platform\\n- Key Responsibilities: Front-End Development, Back-End Development, Full Stack Architecture, Testing\\n2020–2022\\n\",\"skills\":[\"Java\", \"Python\", \"HTML5\", \"CSS\", \"JavaScript\", \"SQL\", \"Machine Learning\", \"Data Structures\", \"Algorithms\", \"Software Engineering\"],\"workExperinces\":[{\n    \"name\":\"deqode solutions\",\n    \"jobResponsiblity\":[\"Agile Methodologies\", \"Software Design\", \"Team Management\", \"Quality Assurance\", \"Client Communication\"],\n    \"startDate\":\"2022\",\n    \"endDate\":\"2024\"\n    },{\n    \"name\":\"Flam\",\n    \"jobResponsiblity\":[\"Front-End Development\", \"Back-End Development\", \"Full Stack Architecture\", \"Testing\"],\n    \"startDate\":\"2020\",\n    \"endDate\":\"2022\"\n    }]\n}");
  const [loading, setLoading] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<'NotGenerated' | 'Generated'>('NotGenerated');
  const theme = useTheme();

  const generateResumeTextFromStudent = (student: IStudentsItem): string => {
    return `You are a professional resume writer. Using the student information provided below, write or craft a clean, well-structured, in JSON stringified.

  Do not include suggestions, comments, notes, or any markdown or formatting instructions. Only return the final resume json in string. Do not include any headings like "Generated Resume".

  Do not include the Full Name and Contact Information section — it will be added manually.

  Ensure the following **exact sections**, in this json structure:
   {
    summary:"", / 50-60 words
    skills: [], 
    workExperinces:[
      {
      name : job1,
      jobResponsiblity:[], max 5 for each job should each be 5-10 words.
      startDate:''
      endDate:''
      }
    ]
   } 

  Student Profile:
  - Full Name: ${student.firstName} ${student.lastName}
  - Date of Birth: ${student.dateOfBirth}
  - Email: ${student.email}
  - Phone: ${student.phoneNumber}
  - Nationality: ${student.nationality}
  - Sex: ${student.sex}
  - Address: ${student.address}
  - University: ${student.universityName}
  - Course : Btech in CS
  - work ex 1 - deqode solutions - solution engineer 
  - work ex 2 - Flam - full stack developer 
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
  const Resume = ({ json }) => {
    const resumeData = json;
    // return <></>
    return (
      <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "#1976d2" }}>
            Resume
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Professional Summary
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: "15px" }}>
              {resumeData.summary}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Skills
            </Typography>
            <Grid2 container spacing={2}>
              {resumeData.skills.map((skill, index) => (
                <Grid2 item xs={6} sm={4} md={3} key={index}>
                  <Box
                    sx={{
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <GridCheckCircleIcon sx={{ fontSize: 6, mr: 1 }} /> {skill}
                  </Box>
                </Grid2>
              ))}
            </Grid2>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Work Experience
            </Typography>

            {resumeData.workExperinces.map((exp, i) => (
              <Box key={i} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {exp.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {exp.startDate} – {exp.endDate}
                </Typography>
                <List dense disablePadding>
                  {exp.jobResponsiblity.map((item, j) => (
                    <ListItem key={j} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: "24px" }}>
                        <GridCheckCircleIcon sx={{ fontSize: 6 }} />
                      </ListItemIcon>
                      <ListItemText primary={item} primaryTypographyProps={{ fontSize: 14 }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        </Paper>
        )
  }

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
      {resumeText && <Resume json={JSON.parse(resumeText)} />}

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
