import { useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Button,
  Typography,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid2,
  IconButton,
  Grid,
  MenuItem,
} from '@mui/material';
import { toast } from 'src/components/snackbar';
import { cohereKey, gradeResultOptions, IStudentsItem } from 'src/types/students';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useTheme } from '@mui/material/styles';
import { GridCheckCircleIcon } from '@mui/x-data-grid';
import { toDMY } from 'src/utils/format-date';
import { useForm, useFieldArray } from 'react-hook-form';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import dayjs from 'dayjs';
import { grey } from 'src/theme';

export function StudentResumeView({
  student,
  onRefresh,
}: {
  student: IStudentsItem;
  onRefresh: () => void;
}) {
  const [resumeText, setResumeText] = useState(
    '{"summary":"Highly motivated Btech in CS student with international work experience seeks to leverage strong problem-solving skills and a solution-oriented mindset in the tech industry. Proficient in collaboration and adapting to diverse team dynamics.\\nSkills: Java, Python, HTML5, CSS, JavaScript, SQL, Machine Learning, Data Structures, Algorithms, Software Engineering\\nWork Experiences:\\n\\ndeqode solutions:\\n- Implemented robust solutions for complex business problems\\n- Developed high-quality software by leading a team of 5 engineers\\n- Responsibilities: Agile Methodologies, Software Design, Team Management, Quality Assurance, Client Communication\\n2022–2024\\n\\nFlam:\\n- Designed and developed user-friendly web applications\\n- Collaborated with a dynamic team to create a robust, scalable platform\\n- Key Responsibilities: Front-End Development, Back-End Development, Full Stack Architecture, Testing\\n2020–2022\\n","skills":["Java", "Python", "HTML5", "CSS", "JavaScript", "SQL", "Machine Learning", "Data Structures", "Algorithms", "Software Engineering"],"workExperiences":[{\n    "name":"deqode solutions",\n    "jobResponsiblity":["Agile Methodologies", "Software Design", "Team Management", "Quality Assurance", "Client Communication"],\n    "startDate":"2022",\n    "endDate":"2024"\n    },{\n    "name":"Flam",\n    "jobResponsiblity":["Front-End Development", "Back-End Development", "Full Stack Architecture", "Testing"],\n    "startDate":"2020",\n    "endDate":"2022"\n    }]\n}'
  );
  const [loading, setLoading] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<'NotGenerated' | 'Generated'>('NotGenerated');
  const theme = useTheme();

  const ResumeSchema = zod.object({
    firstName: zod.string().min(1, 'First name is required'),
    lastName: zod.string().min(1, 'Last name is required'),
    dateOfBirth: zod.string().min(1, { message: 'Date of Birth is required!' }),
    phoneNumber: zod.string().min(5, { message: 'Phone Number is required!' }),
    email: zod.string().email('Valid email required'),
    address: zod.string().optional(),
    nationality: zod.string().min(1, { message: 'Nationality is required!' }),
    highestQualification: zod
      .object({
        startDate: zod.string().optional(),
        endDate: zod.string().optional(),
        gradeResult: zod.string().optional(),
        institutionName: zod.string().optional(),
        countryOfIssue: zod.string().optional(),
      })
      .optional(),
    workExperience: zod
      .array(
        zod.object({
          jobTitle: zod.string(),
          companyName: zod.string(),
          companyAddress: zod.string().optional(),
          startDate: zod.string().optional(),
          endDate: zod.string().optional(),

          jobResponsibilities: zod.string(),
        })
      )
      .optional(),
    summary: zod.string(),
    skills: zod.array(zod.string()),
    languages: zod.array(zod.string()),
  });

  const defaultValues = {
    firstName: student.firstName || '',
    lastName: student.lastName || '',
    dateOfBirth: toDMY(student?.dateOfBirth).toDateString(),
    phoneNumber: student.phoneNumber || '',
    email: student.email || '',
    address: student.address || '',
    nationality: student.nationality || '',
    highestQualification: {
      startDate: toDMY(student?.highestQualification?.startDate).toDateString(),
      endDate: toDMY(student?.highestQualification?.endDate).toDateString(),
      gradeResult: student?.highestQualification?.gradeResult || '',
      institutionName: student?.highestQualification?.institutionName || '',
      countryOfIssue: student?.highestQualification?.countryOfIssue || '',
    },
    workExperience: [
      {
        jobTitle: '',
        companyName: '',
        companyAddress: '',
        startDate: null,
        endDate: null,
        jobResponsibilities: '',
      },
    ],
    summary: '',
    skills: [''],
    languages: [''],
  };

  function ResumeBuilderForm() {
    const methods = useForm({
      resolver: zodResolver(ResumeSchema),
      defaultValues,
    });

    const {
      control,
      handleSubmit,
      formState: { isSubmitting },
    } = methods;

    const {
      fields: workFields,
      append: appendWork,
      remove: removeWork,
    } = useFieldArray({ control, name: 'workExperience' });

    const {
      fields: skillFields,
      append: appendSkill,
      remove: removeSkill,
    } = useFieldArray({ control, name: 'skills' });

    const {
      fields: languageFields,
      append: appendLanguage,
      remove: removeLanguage,
    } = useFieldArray({ control, name: 'languages' });

    const onSubmit = async (data) => {
      console.log('Resume data:', data);
    };

    return (
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 2 }}>
              Personal Information
            </Typography>
            <Field.Text name="firstName" label="First Name" />
            <Field.Text name="lastName" label="Last Name" />
            <Field.Text name="email" label="Email" />
            <Field.Text name="phoneNumber" label="Phone Number" />
            <Field.DatePicker name="dateOfBirth" label="Date of Birth" />
            <Field.CountrySelect
              name="nationality"
              label="Nationality"
              getValue="name"
              id="nationality"
            />
            <Field.Text name="address" label="Address" sx={{ gridColumn: 'span 2' }} />
          </Box>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Typography variant="subtitle2" sx={{ gridColumn: 'span 2', mt: 2 }}>
              Highest Qualification
            </Typography>
            <Field.Text name="highestQualification.institutionName" label="Institution Name" />
            <Field.Select name="highestQualification.gradeResult" label="Grade Result">
              {gradeResultOptions.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.DatePicker
              name="highestQualification.startDate"
              label="Start Date"
              maxDate={dayjs()}
            />
            <Field.DatePicker
              name="highestQualification.endDate"
              label="End Date"
              maxDate={dayjs()}
            />
            <Field.CountrySelect
              name="highestQualification.countryOfIssue"
              label="Country Of Issue"
              getValue="name"
              id="countryOfIssue"
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 4 }}>
              Work Experience
            </Typography>
            {workFields.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  gridColumn: 'span 2',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2">Experience #{index + 1}</Typography>
                  {index > 0 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeWork(index)}
                      startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <Field.Text name={`workExperience.${index}.jobTitle`} label="Job Title" />
                  <Field.Text name={`workExperience.${index}.companyName`} label="Company Name" />
                  <Field.DatePicker name={`workExperience.${index}.startDate`} label="Start Date" />
                  <Field.DatePicker name={`workExperience.${index}.endDate`} label="End Date" />
                  <Field.Text
                    name={`workExperience.${index}.jobResponsibilities`}
                    label="Job Description"
                    rows={3}
                    sx={{ gridColumn: 'span 2' }}
                  />
                </Box>
              </Box>
            ))}
            <Button
              onClick={() =>
                appendWork({
                  jobTitle: '',
                  companyName: '',
                  companyAddress: '',
                  startDate: null,
                  endDate: null,
                  jobResponsibilities: '',
                })
              }
              sx={{ gridColumn: 'span 2' }}
            >
              Add Experience
            </Button>
          </Box>
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 4 }}>
              Professional Summary
            </Typography>
            <Field.Text
              name="summary"
              label="Brief Summary"
              rows={4}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 4 }}>
              Skills
            </Typography>
            {skillFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 1, gridColumn: 'span 2' }}>
                <Field.Text name={`skills.${index}`} label={`Skill ${index + 1}`} />
                <IconButton onClick={() => removeSkill(index)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            ))}
            <Button onClick={() => appendSkill('')} sx={{ gridColumn: 'span 2' }}>
              Add Skill
            </Button>
          </Box>
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 4 }}>
              Languages
            </Typography>
            {languageFields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 1, gridColumn: 'span 2' }}>
                <Field.Text name={`languages.${index}`} label={`Language ${index + 1}`} />
                <IconButton onClick={() => removeLanguage(index)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            ))}
            <Button onClick={() => appendLanguage('')} sx={{ gridColumn: 'span 2' }}>
              Add Language
            </Button>
          </Box>

          <Box>
            <Button variant="outlined" disabled={isSubmitting} color="secondary">
              Save Resume
            </Button>
          </Box>
        </Box>
      </Form>
    );
  }

  const generateResumeTextFromStudent = (student: IStudentsItem): string => {
    return `You are a professional resume writer. Using the student information provided below, write or craft a clean, well-structured, in JSON stringified.

  Do not include suggestions, comments, notes, or any markdown or formatting instructions. Only return the final resume json in string. Do not include any headings like "Generated Resume".

  Do not include the Full Name and Contact Information section — it will be added manually.

  Ensure the following **exact sections**, in this json structure:
   {
    summary:"", / 50-60 words
    skills: [],
    workExperiences:[
      {
      name : job1,
      jobResponsibilities:[], max 5 for each job should each be 5-10 words.
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
  - Course : ${student.courseName}
  - highestQualification: {
      startDate: ${toDMY(defaultValues.highestQualification.startDate).toDateString()},
      endDate: ${toDMY(defaultValues.highestQualification.endDate).toDateString()},
      gradeResult: ${defaultValues.highestQualification.gradeResult},
      institutionName: ${defaultValues.highestQualification.institutionName},
      countryOfIssue: ${defaultValues.highestQualification.countryOfIssue},
    },
  -workExperience: [
      {
        jobTitle: ${defaultValues.workExperience?.[0]?.jobTitle},
        companyName: ${defaultValues.workExperience?.[0]?.companyName},
        companyAddress: ${defaultValues.workExperience?.[0]?.companyAddress},
        startDate: ${toDMY(defaultValues.workExperience?.[0]?.startDate).toDateString()},
        endDate: ${toDMY(defaultValues.workExperience?.[0]?.endDate).toDateString()},
        jobResponsibilities: ${defaultValues.workExperience?.[0]?.jobResponsibilities},
      },
    ],
  `;
  };

  const handleGenerateResume = async () => {
    setLoading(true);
    try {
      const prompt = generateResumeTextFromStudent(student);
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cohereKey}`,
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
  const Resume = ({ jsonString }: { jsonString: string }) => {
    const resumeData = jsonString;
    try {
      return (
        <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
            Resume
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Professional Summary
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '15px' }}>
              {resumeData.summary}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Skills
            </Typography>
            <Grid2 container spacing={2}>
              {resumeData.skills.map((skill: string, index: number) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box
                    sx={{
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <GridCheckCircleIcon sx={{ fontSize: 6, mr: 1 }} /> {skill}
                  </Box>
                </Grid>
              ))}
            </Grid2>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Work Experience
            </Typography>

            {resumeData.workExperiences.map((exp, i) => (
              <Box key={i} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {exp.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {exp.startDate} – {exp.endDate}
                </Typography>
                <List dense disablePadding>
                  {exp.jobResponsibilities.map((item, j) => (
                    <ListItem key={j} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: '24px' }}>
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
      );
    } catch (e) {
      return <Typography color="error">Invalid resume data</Typography>;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Card sx={{ p: 2 }}>
        <Stack direction="column" spacing={2} maxWidth={'100%'}>
          <Box>
            <Typography variant="h4">Resume Builder</Typography>
            <ResumeBuilderForm />
          </Box>
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : resumeStatus === 'NotGenerated' ? (
            <Button variant="outlined" onClick={handleGenerateResume} color="info">
              Generate Resume
            </Button>
          ) : (
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                alignItems: 'center',
                height: 'auto',
                justifyContent: 'space-around',
                padding: 2,
                backgroundColor: theme.palette.grey[400],
              }}
            >
              {resumeStatus === 'Generated' && resumeText && (
                <Resume jsonString={JSON.parse(resumeText)} />
              )}
              <Stack direction="row" justifyContent={'center'} paddingTop={2}>
                <Button variant="outlined" onClick={handleGenerateResume} color="warning">
                  Update Resume
                </Button>
                <Button variant="outlined" color="success" onClick={handleDownloadDocx}>
                  Download Resume (DOCX)
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      </Card>
    </Box>
  );
}

// (
//   <Card sx={{ backgroundColor: theme.palette.background.default }}>
//     <Box
//       sx={{
//         border: '1px solid #ccc',
//         borderRadius: 2,
//         padding: 2,
//         overflowY: 'auto',
//         fontFamily: 'Arial',
//         fontSize: '14px',
//         lineHeight: 1.8,
//       }}
//     >
//       {/* ✅ Manually inserted name + contact */}
//       <Box sx={{ textAlign: 'center', mb: 3 }}>
//         <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//           {`${student.firstName} ${student.lastName}`}
//         </Typography>
//         <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
//           {`${student.phoneNumber}  ${student.email}`}
//         </Typography>
//         {student.address && <Typography variant="body2">{student.address}</Typography>}
//       </Box>
//       {/* 🔄 AI-generated resume preview */}
//       {resumeText.split('\n').map((line, index) => {
//         const trimmed = line.trim();

//         const isSectionTitle = [
//           'Professional Summary',
//           'Work History',
//           'Skills',
//           'Education',
//           'Languages',
//           'References',
//           'Additional Information',
//         ].some((section) => trimmed.toLowerCase().startsWith(section.toLowerCase()));

//         return (
//           <Box key={index} sx={{ mb: 2 }}>
//             {isSectionTitle && (
//               <>
//                 <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                   {trimmed}
//                 </Typography>
//                 <Divider sx={{ my: 1 }} />
//               </>
//             )}
//             {!isSectionTitle && (
//               <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
//                 {trimmed}
//               </Typography>
//             )}
//           </Box>
//         );
//       })}
//     </Box>
//   </Card>;
// )
