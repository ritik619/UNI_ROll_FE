import { Key, useState } from 'react';
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
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
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

export function StudentResumeView({
  student,
  onRefresh,
}: {
  student: IStudentsItem;
  onRefresh: () => void;
}) {
  const [resumeText, setResumeText] = useState(
    '{"summary":"Highly motivated Btech in CS student with international work experience seeks to leverage strong problem-solving skills and a solution-oriented mindset in the tech industry. Proficient in collaboration and adapting to diverse team dynamics.\\nSkills: Java, Python, HTML5, CSS, JavaScript, SQL, Machine Learning, Data Structures, Algorithms, Software Engineering\\nWork History:\\n\\ndeqode solutions:\\n- Implemented robust solutions for complex business problems\\n- Developed high-quality software by leading a team of 5 engineers\\n- Responsibilities: Agile Methodologies, Software Design, Team Management, Quality Assurance, Client Communication\\n2022–2024\\n\\nFlam:\\n- Designed and developed user-friendly web applications\\n- Collaborated with a dynamic team to create a robust, scalable platform\\n- Key Responsibilities: Front-End Development, Back-End Development, Full Stack Architecture, Testing\\n2020–2022\\n","skills":["Java", "Python", "HTML5", "CSS", "JavaScript", "SQL", "Machine Learning", "Data Structures", "Algorithms", "Software Engineering"],"workHistorys":[{\n    "name":"deqode solutions",\n    "jobResponsiblity":["Agile Methodologies", "Software Design", "Team Management", "Quality Assurance", "Client Communication"],\n    "startDate":"2022",\n    "endDate":"2024"\n    },{\n    "name":"Flam",\n    "jobResponsiblity":["Front-End Development", "Back-End Development", "Full Stack Architecture", "Testing"],\n    "startDate":"2020",\n    "endDate":"2022"\n    }]\n}'
  );
  const [loading, setLoading] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<'NotGenerated' | 'Generated'>('NotGenerated');
  const theme = useTheme();

  const [formData, setFormData] = useState<ResumeFormValues | null>(null);

  const ResumeSchema = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    dateOfBirth: zod.string().optional(),
    phoneNumber: zod.string().optional(),
    email: zod.string().optional(),
    sex: zod.string().optional(),
    address: zod.string().optional(),
    nationality: zod.string().optional(),
    universityName: zod.string().optional(),
    courseName: zod.string().optional(),
    highestQualification: zod
      .object({
        startDate: zod.string().optional(),
        endDate: zod.string().optional(),
        gradeResult: zod.string().optional(),
        institutionName: zod.string().optional(),
        countryOfIssue: zod.string().optional(),
      })
      .optional(),
    workHistory: zod
      .array(
        zod.object({
          jobTitle: zod.string().optional(),
          companyName: zod.string().optional(),
          companyAddress: zod.string().optional(),
          startDate: zod.string().optional(),
          endDate: zod.string().optional(),
          jobResponsibilities: zod.string().optional(),
        })
      )
      .optional(),
    summary: zod.string().optional(),
    skills: zod.array(zod.object({ value: zod.string().optional() })).optional(),
    languages: zod.array(zod.object({ value: zod.string().optional() })).optional(),
  });

  type ResumeFormValues = zod.infer<typeof ResumeSchema>;

  const defaultValues = {
    firstName: student.firstName,
    lastName: student.lastName,
    dateOfBirth: toDMY(student?.dateOfBirth).toDateString(),
    sex: student.sex,
    phoneNumber: student.phoneNumber,
    email: student.email,
    address: student.address,
    nationality: student.nationality,
    universityName: student.universityName,
    courseName: student.courseName,
    highestQualification: {
      startDate: toDMY(student?.highestQualification?.startDate).toDateString(),
      endDate: toDMY(student?.highestQualification?.endDate).toDateString(),
      gradeResult: student?.highestQualification?.gradeResult || '',
      institutionName: student?.highestQualification?.institutionName || '',
      countryOfIssue: student?.highestQualification?.countryOfIssue || '',
    },
    workHistory: [
      {
        jobTitle: '',
        companyName: '',
        companyAddress: '',
        startDate: '',
        endDate: '',
        jobResponsibilities: '',
      },
    ],
    summary: '',
    skills: [{ value: '' }],
    languages: [{ value: '' }],
  };

  function ResumeBuilderForm({ defaultValues }: { defaultValues: ResumeFormValues }) {
    const methods = useForm<ResumeFormValues>({
      resolver: zodResolver(ResumeSchema),
      defaultValues,
      mode: 'onChange',
      // values: defaultValues, // This ensures values are synced without reset
    });

    const {
      control,
      handleSubmit,
      formState: { isSubmitting },
      setValue,
    } = methods;

    const {
      fields: workFields,
      append: appendWork,
      remove: removeWork,
    } = useFieldArray<ResumeFormValues, 'workHistory', 'id'>({
      control,
      name: 'workHistory',
    });

    const {
      fields: skillFields,
      append: appendSkill,
      remove: removeSkill,
    } = useFieldArray<ResumeFormValues, 'skills', 'id'>({
      control,
      name: 'skills',
    });

    const {
      fields: languageFields,
      append: appendLanguage,
      remove: removeLanguage,
    } = useFieldArray<ResumeFormValues, 'languages', 'id'>({
      control,
      name: 'languages',
    });

    const onSubmit = async (data: ResumeFormValues) => {
      setFormData(data);
      console.log('resume data', data); // ✅ Store updated values

      // const prompt = generateResumeTextFromStudent(data);

      // setResumeStatus('Generated');

      toast.success('Resume saved! Click "Generate Resume" to preview.');
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
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(1, 1fr)' },
            }}
          >
            <Typography variant="subtitle2" sx={{ gridColumn: 'span 2', mt: 2 }}>
              Education
            </Typography>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="universityName" label="University Name" disabled />
              <Field.Text name="courseName" label="Course Name" disabled />
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  gridColumn: 'span 2',
                }}
              >
                <Typography variant="subtitle2" sx={{ gridColumn: 'span 2', m: 1, mb: 2 }}>
                  Highest Qualification
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <Field.Text
                    name="highestQualification.institutionName"
                    label="Institution Name"
                  />
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
              </Box>
            </Box>
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
              Work History
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
                  <Field.Text name={`workHistory.${index}.jobTitle`} label="Job Title" />
                  <Field.Text name={`workHistory.${index}.companyName`} label="Company Name" />
                  <Field.Text
                    name={`workHistory.${index}.companyAddress`}
                    label="Company Address"
                    sx={{ gridColumn: 'span 2' }}
                  />
                  <Field.DatePicker name={`workHistory.${index}.startDate`} label="Start Date" />
                  <Field.DatePicker name={`workHistory.${index}.endDate`} label="End Date" />
                  <Field.Text
                    name={`workHistory.${index}.jobResponsibilities`}
                    label="Job Responsibilities"
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
                  startDate: '',
                  endDate: '',
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
                <Field.Text name={`skills.${index}.value`} label={`Skill ${index + 1}`} />
                <IconButton onClick={() => removeSkill(index)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            ))}
            <Button onClick={() => appendSkill({ value: '' })} sx={{ gridColumn: 'span 2' }}>
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
                <Field.Text name={`languages.${index}.value`} label={`Language ${index + 1}`} />
                <IconButton onClick={() => removeLanguage(index)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            ))}
            <Button onClick={() => appendLanguage({ value: '' })} sx={{ gridColumn: 'span 2' }}>
              Add Language
            </Button>
          </Box>

          <Box>
            <Button type="submit" variant="outlined" disabled={isSubmitting} color="secondary">
              Save Resume
            </Button>
          </Box>
        </Box>
      </Form>
    );
  }

  const generateResumeTextFromStudent = (data: ResumeFormValues): string => {
    const formatDate = (value?: string) =>
      value && !isNaN(new Date(value).getTime()) ? new Date(value).toDateString() : '';

    const hq = data.highestQualification || {};
    const we = data.workHistory ?? [];

    const resumeJson = {
      personalDetails: {
        dateOfBirth: formatDate(data.dateOfBirth),
        sex: data.sex,
        nationality: data.nationality,
      },
      education: {
        universityName: data.universityName,
        courseName: data.courseName,
        highestQualification: {
          startDate: formatDate(hq.startDate),
          endDate: formatDate(hq.endDate),
          gradeResult: hq.gradeResult || '',
          institutionName: hq.institutionName || '',
          countryOfIssue: hq.countryOfIssue || '',
        },
      },
      workHistory: we.map((item) => ({
        jobTitle: item.jobTitle,
        companyName: item.companyName,
        companyAddress: item.companyAddress,
        startDate: formatDate(item.startDate),
        endDate: formatDate(item.endDate),
        jobResponsibilities: item.jobResponsibilities,
      })),
      summary: data.summary || '',
      skills: (data.skills || []).map((s) => s?.value || '').filter(Boolean),
      languages: (data.languages || []).map((l) => l?.value || '').filter(Boolean),
    };

    const instruction = ` Instruction are as follows:-
    1. You are a professional resume writer. Based on the student profile below.
    2. either i pass summary empty or not , you will create it and retun it. and if i do just pass the summary plz just update summary value and return .
    3. same goes for skills too.
    2. Return a clean, well-structured JSON string.
    3. Do not include suggestions, comments, notes, or any markdown
    or formatting instructions or explanation or any extra text.
    4. Only return the final resume json in string.
    5. Do not include any headings like "Generated Resume".`;

    const studentProfile = {
      fullName: `${data.firstName} ${data.lastName}`,
      phone: data.phoneNumber,
      email: data.email,
      address: data.address,
      ...resumeJson,
    };
    console.log('studentProfile', studentProfile);

    return `${instruction}\n\n${JSON.stringify(studentProfile)}`;
  };

  const handleGenerateResume = async () => {
    if (!formData) {
      toast.error('Please save the resume first.');
      return;
    }
    setLoading(true);
    console.log('Prompt being sent to Cohere:', prompt);
    try {
      console.log(
        ' generateResumeTextFromStudent(formData);',
        generateResumeTextFromStudent(formData),
        'formData',
        formData
      );
      const prompt = generateResumeTextFromStudent(formData);
      console.log('prompt', prompt);
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
      console.log('response', response);

      const data = await response.json();
      console.log('response data', data);

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
  console.log('generate resumeText', resumeText);

  const handleDownloadDocx = async () => {
    const documentChildren = [];
    let resumeData;
    try {
      resumeData = JSON.parse(resumeText);
    } catch (error) {
      console.error('Error parsing resumeText JSON:', error);
      alert('Failed to parse resume data. Please check the resumeText format.');
      return; // Stop the function if parsing fails
    }
    // --- Name and Contact Info ---
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.fullName,
            bold: true,
            size: 36, // Corresponds to 18pt
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.CENTER, // Use AlignmentType.CENTER
        spacing: { after: 100 }, // Spacing in TWIPs (1/20th of a point)
      })
    );

    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${resumeData.phone}   ${resumeData.email}`,
            italics: true,
            size: 24, // Corresponds to 12pt
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    if (resumeData.address) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.address,
              size: 24,
              font: 'Arial',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    // --- Professional Summary ---
    if (resumeData.summary) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Professional Summary',
              bold: true, // Make section titles bold
              size: 28, // Corresponds to 14pt
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 150 },
          indent: { left: 300 }, // Indent for the title
        })
      );
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
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.summary,
              size: 24,
              font: 'Arial',
            }),
          ],
          spacing: { after: 200 },
          indent: { left: 300 }, // Indent for content
        })
      );
    }

    // --- Work History ---
    if (Array.isArray(resumeData.workHistory) && resumeData.workHistory.length > 0) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Work History',
              bold: true,
              size: 28,
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 150 },
          indent: { left: 300 },
        })
      );
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
      resumeData.workHistory.forEach((job) => {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${job.jobTitle} at ${job.companyName}`,
                bold: true,
                size: 26, // Slightly smaller than section title
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 300 },
          })
        );
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${job.startDate} – ${job.endDate} | ${job.companyAddress}`,
                size: 22, // Smaller for dates/location
                font: 'Arial',
                color: '888888', // Grey out text for dates
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 300 },
          })
        );
        if (Array.isArray(job.jobResponsibilities) && job.jobResponsibilities.length > 0) {
          job.jobResponsibilities.forEach((responsibility) => {
            documentChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${responsibility}`, // Add bullet point
                    size: 24,
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 50 },
                indent: { left: 450, hanging: 150 }, // Hanging indent for bullet points
              })
            );
          });
        }
        documentChildren.push(new Paragraph({ spacing: { after: 200 } })); // Add extra space after each job
      });
    }

    // --- Skills ---
    if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Skills',
              bold: true,
              size: 28,
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 150 },
          indent: { left: 300 },
        })
      );
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
      // Combine skills into a single paragraph or use multiple for better formatting control
      const skillRuns = resumeData.skills.map((skill, index) => {
        return new TextRun({
          text: `${skill}${index < resumeData.skills.length - 1 ? ', ' : ''}`, // Join with comma and space
          size: 24,
          font: 'Arial',
        });
      });
      documentChildren.push(
        new Paragraph({
          children: skillRuns,
          spacing: { after: 200 },
          indent: { left: 300 },
        })
      );
    }

    // --- Education ---
    if (resumeData.education) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Education',
              bold: true,
              size: 28,
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 150 },
          indent: { left: 300 },
        })
      );
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

      if (resumeData.education.courseName && resumeData.education.universityName) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${resumeData.education.courseName} from ${resumeData.education.universityName}`,
                bold: true,
                size: 26,
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 300 },
          })
        );
      }

      if (resumeData.education.highestQualification) {
        const hq = resumeData.education.highestQualification;
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Highest Qualification:',
                bold: true,
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 300 },
          })
        );
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Institution: ${hq.institutionName}`, size: 24, font: 'Arial' }),
            ],
            spacing: { after: 50 },
            indent: { left: 350 },
          })
        );
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Duration: ${hq.startDate} – ${hq.endDate}`,
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 350 },
          })
        );
        documentChildren.push(
          new Paragraph({
            children: [new TextRun({ text: `Grade: ${hq.gradeResult}`, size: 24, font: 'Arial' })],
            spacing: { after: 50 },
            indent: { left: 350 },
          })
        );
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Country: ${hq.countryOfIssue}`, size: 24, font: 'Arial' }),
            ],
            spacing: { after: 200 },
            indent: { left: 350 },
          })
        );
      }
    }

    // --- Languages ---
    if (Array.isArray(resumeData.languages) && resumeData.languages.length > 0) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Languages',
              bold: true,
              size: 28,
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 150 },
          indent: { left: 300 },
        })
      );
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
      resumeData.languages.forEach((lang) => {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${lang}`, // Add bullet point
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 450, hanging: 150 }, // Hanging indent for bullet points
          })
        );
      });
      documentChildren.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // --- Personal Details ---
    if (resumeData.personalDetails) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Personal Details',
              bold: true,
              size: 28,
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 150 },
          indent: { left: 300 },
        })
      );
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
      if (resumeData.personalDetails.dateOfBirth) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Date of Birth:', bold: true, size: 24, font: 'Arial' }),
              new TextRun({
                text: ` ${resumeData.personalDetails.dateOfBirth}`,
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 300 },
          })
        );
      }
      if (resumeData.personalDetails.sex) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Sex:', bold: true, size: 24, font: 'Arial' }),
              new TextRun({ text: ` ${resumeData.personalDetails.sex}`, size: 24, font: 'Arial' }),
            ],
            spacing: { after: 50 },
            indent: { left: 300 },
          })
        );
      }
      if (resumeData.personalDetails.nationality) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Nationality:', bold: true, size: 24, font: 'Arial' }),
              new TextRun({
                text: ` ${resumeData.personalDetails.nationality}`,
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 200 },
            indent: { left: 300 },
          })
        );
      }
    }

    const doc = new Document({
      // Renamed from DocxDocument to Document based on common docx library usage
      sections: [
        {
          children: documentChildren,
        },
      ],
    });

    const safeName = `${resumeData.fullName}`.replace(/[^a-zA-Z0-9_ ]/g, '').replace(/ /g, '_'); // Use fullName for filename, make it safer
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${safeName}_Resume.docx`);
  };
  const Resume = ({ json }: { json: any }) => {
    const resumeData = json;
    console.log('resumeData', resumeData);
    try {
      return (
        <Paper elevation={3} sx={{ m: 2, p: 2, borderRadius: 3 }}>
          {/* Full Name - Centered at the top */}
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              display: 'flex',
              justifyContent: 'center',
              mb: 1, // Reduced margin-bottom as contact details are directly below
            }}
          >
            {resumeData.fullName}
          </Typography>
          {/* Contact Information - Centered below name */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center', // Changed to center
              gap: 4, // Added gap for spacing between contact details
              mx: 3,
              my: 1,
              flexWrap: 'wrap', // Allows items to wrap on smaller screens
            }}
          >
            {/* Removed redundant nested Typography */}
            <Typography variant="body1" sx={{ fontSize: '15px' }}>
              {resumeData.phone}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '15px' }}>
              {resumeData.email}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '15px' }}>
              {resumeData.address}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} /> {/* Increased margin for better separation */}
          {/* Summary */}
          {resumeData?.summary && (
            <Box sx={{ m: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Professional Summary
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '15px' }}>
                {resumeData.summary}
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          {/* Work History */}
          {Array.isArray(resumeData?.workHistory) && resumeData.workHistory.length > 0 && (
            <Box sx={{ m: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Work History
              </Typography>
              {resumeData.workHistory.map((exp, i) => (
                <Box key={i} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {exp.jobTitle} at {exp.companyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {exp.startDate} – {exp.endDate} | {exp.companyAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    Responsibilities:
                    <br />
                    {exp.jobResponsibilities}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          {/* Skills */}
          {Array.isArray(resumeData?.skills) && resumeData.skills.length > 0 && (
            <Box sx={{ m: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Skills
              </Typography>
              <Grid container spacing={2}>
                {resumeData.skills.map((skill, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                      <GridCheckCircleIcon sx={{ fontSize: 14, mr: 1, color: 'success.main' }} />
                      {typeof skill === 'string' ? skill : skill?.value}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          {/* Education */}
          {resumeData?.education && (
            <Box sx={{ m: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Education
              </Typography>
              <Typography variant="subtitle1">
                **{resumeData.education?.courseName}** from {resumeData.education?.universityName}
              </Typography>
              {resumeData.education.highestQualification && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    **Highest Qualification:**
                    <br />
                    Institution: {resumeData.education.highestQualification.institutionName}
                    <br />
                    Duration: {resumeData.education.highestQualification.startDate} –{' '}
                    {resumeData.education.highestQualification.endDate}
                    <br />
                    Grade: {resumeData.education.highestQualification.gradeResult}
                    <br />
                    Country: {resumeData.education.highestQualification.countryOfIssue}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          {/* Languages */}
          {Array.isArray(resumeData?.languages) && resumeData.languages.length > 0 && (
            <Box sx={{ m: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Languages
              </Typography>
              <Grid container spacing={2}>
                {resumeData.languages.map((lang, index) => (
                  <Grid item key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                      <GridCheckCircleIcon sx={{ fontSize: 14, m: 1, color: 'success.main' }} />
                      {typeof lang === 'string' ? lang : lang?.value}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          {/* Personal Details - Updated for better appearance */}
          {resumeData?.personalDetails && (
            <Box sx={{ m: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Personal Details
              </Typography>
              {resumeData.personalDetails?.dateOfBirth && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <Typography component="span" fontWeight="bold">
                    Date of Birth:
                  </Typography>{' '}
                  {resumeData.personalDetails.dateOfBirth}
                </Typography>
              )}
              {resumeData.personalDetails?.sex && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <Typography component="span" fontWeight="bold">
                    Sex:
                  </Typography>{' '}
                  {resumeData.personalDetails.sex}
                </Typography>
              )}
              {resumeData.personalDetails?.nationality && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <Typography component="span" fontWeight="bold">
                    Nationality:
                  </Typography>{' '}
                  {resumeData.personalDetails.nationality}
                </Typography>
              )}
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
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
            <ResumeBuilderForm defaultValues={formData || defaultValues} />
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
              {resumeStatus === 'Generated' && (
                <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
                  Resume Preview
                </Typography>
              )}
              {resumeStatus === 'Generated' && resumeText && (
                <Resume json={JSON.parse(resumeText)} />
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
