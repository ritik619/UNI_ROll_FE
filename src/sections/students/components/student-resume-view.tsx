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
  IconButton,
  Grid,
  Chip,
  TextField,
} from '@mui/material';
import { toast } from 'src/components/snackbar';
import { IStudentsItem } from 'src/types/students';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { useTheme } from '@mui/material/styles';
import { GridCheckCircleIcon } from '@mui/x-data-grid';
import { formatDateToDDMMYYYY, toDate, toDMY } from 'src/utils/format-date';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';
import dayjs from 'dayjs';

export function StudentResumeView({
  // student,
  onRefresh,
}: {
  // student: IStudentsItem;
  onRefresh: () => void;
}) {
  const [resumeJSON, setResumeJSON] = useState<{
    briefSummary: string;
    skills: string[];
    experiences: any[];
  }>();
  const [loading, setLoading] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<'NotGenerated' | 'Generated'>('NotGenerated');
  const theme = useTheme();
  const student = {
    id: '6zWYs4KMDeqzHCxVXBmJ',
    leadNumber: 'STU-20250620-8859',
    firstName: 'Ritik',
    firstNameLower: 'ritik',
    lastNameLower: 'saini',
    insuranceNumber: '',
    lastName: 'Saini',
    dateOfBirth: '01/06/2025',
    email: 'ritiksaini61977665@gmail.com',
    coverPhoto:
      'https://firebasestorage.googleapis.com/v0/b/uni-enroll-e95e7.firebasestorage.app/o/students%2Ffunction%20V()%7Breturn%22xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx%22.replace(%2F%5Bxy%5D%2Fg%2Cr%3D%3E%7Blet%20e%3DMath.random()*16%7C0%3Breturn(r%3D%3D%3D%22x%22%3Fe%3Ae%263%7C8).toString(16)%7D)%7D.jpeg?alt=media&token=5d382e77-3cee-408c-9dd9-370d0a338c4e',
    phoneNumber: '08823873121',
    phonePrefix: '+91',
    nationality: 'Afghanistan',
    sex: 'Male',
    address: 'S-518',
    postCode: '462003',
    agentId: 'ZvR2fN4SvphN40XsEpOGYGJubD93',
    highestQualification: {
      startDate: {
        _seconds: 1751673600,
        _nanoseconds: 0,
      },
      endDate: {
        _seconds: 1762387200,
        _nanoseconds: 0,
      },
      gradeResult: 'First Class',
      institutionName: 'LNCT',
      countryOfIssue: 'Afghanistan',
    },
    documents: {},
    createdAt: {
      _seconds: 1750393750,
      _nanoseconds: 404000000,
    },
    universityName: 'Maulana Azad National Institute of Technology',
    universityId: 'L1KaHRZ8VHsx6YgUJiv0',
    courseName: 'Master of Business Administration',
    intakeId: 'yACQDoGsTHjKbiQcfjwO',
    courseId: 'cvvdUJNSfoJxf4shc7nK',
    status: 'Withdrawn',
    updatedAt: {
      _seconds: 1750393751,
      _nanoseconds: 393000000,
    },
    professionalSummary: {
      skills: ['Java', 'Python', 'Communication'],
      languages: ['Spanish', 'English'],
      briefSummary:
        'Was a important person in the fiedld doing xyz.Was a important person in the fiedld doing xyz.Was a important person in the fiedld doing xyz.Was a important person in the fiedld doing xyz',
    },
    experiences: [
      {
        jobTitle: 'Solution engineer',
        companyName: 'Deqode',
        companyAddress: 'Indore',
        startDate: {
          _seconds: 1750393751,
          _nanoseconds: 393000000,
        },
        endDate: {
          _seconds: 1750393751,
          _nanoseconds: 393000000,
        },
        isPresentlyWorking: true,
        jobResponsibilities: [
          'Was a important person in the fiedld doing xyz',
          'Was a important person in the fiedld doing xyz',
        ],
      },
    ],
  };

  const ResumeSchema = zod.object({
    // highestQualification: zod
    //   .object({
    //     startDate: zod.any().optional(),
    //     endDate: zod.any().optional(),
    //     gradeResult: zod.string().optional(),
    //     institutionName: zod.string().optional(),
    //     countryOfIssue: zod.string().optional(),
    //   })
    //   .optional(),
    experiences: zod
      .array(
        zod.object({
          jobTitle: zod.string().min(1, 'Job Title cannot be empty'),
          companyName: zod.string().min(1, 'Job Title cannot be empty'),
          companyAddress: zod.string().optional(),
          startDate: zod.any().optional(),
          endDate: zod.any().optional(),
          isPresentlyWorking: zod.boolean(),
          jobResponsibilities: zod.array(zod.object({ value: zod.string().optional() })).optional(),
        })
      )
      .optional(),
    briefSummary: zod.string().optional(),
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
      startDate: dayjs(toDMY(student?.highestQualification?.startDate)),
      endDate: dayjs(toDMY(student?.highestQualification?.endDate)),
      gradeResult: student?.highestQualification?.gradeResult || '',
      institutionName: student?.highestQualification?.institutionName || '',
      countryOfIssue: student?.highestQualification?.countryOfIssue || '',
    },
    experiences: student?.experiences
      ? student?.experiences?.map((i) => ({
          ...i,
          jobResponsibilities: i.jobResponsibilities.map((j) => ({ value: j })),
          startDate: dayjs(toDMY(i.startDate)),
          ...(i?.endDate && { endDate: dayjs(toDMY(i.endDate)) }),
        }))
      : [
          {
            jobTitle: '',
            companyName: '',
            companyAddress: '',
            startDate: '',
            endDate: '',
            jobResponsibilities: [],
            isPresentlyWorking: false,
          },
        ],
    briefSummary: student?.professionalSummary?.briefSummary || '',
    skills: student?.professionalSummary?.skills?.map((i) => ({ value: i })) || [],
    languages: student?.professionalSummary?.languages?.map((i) => ({ value: i })) || [],
  };
  function ExperiencesItem({
    control,
    index,
    remove,
  }: {
    control: any;
    index: number;
    remove: (index: number) => void;
  }) {
    const {
      fields,
      append,
      remove: removeResponsibility,
    } = useFieldArray({
      control,
      name: `experiences.${index}.jobResponsibilities`,
    });
    const isWorking = useWatch({
      control,
      name: `experiences.${index}.isPresentlyWorking`,
    });

    return (
      <Box
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          gridColumn: 'span 2',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Experience #{index + 1}</Typography>
          {index > 0 && (
            <Button
              size="small"
              color="error"
              onClick={() => remove(index)}
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
          <Field.Text name={`experiences.${index}.jobTitle`} label="Job Title" />
          <Field.Text name={`experiences.${index}.companyName`} label="Company Name" />
          <Field.Text
            name={`experiences.${index}.companyAddress`}
            label="Company Address"
            sx={{ gridColumn: 'span 2' }}
          />
          <Field.DatePicker name={`experiences.${index}.startDate`} label="Start Date" />
          {!isWorking && (
            <Field.DatePicker name={`experiences.${index}.endDate`} label="End Date" />
          )}

          <Field.Checkbox
            sx={{
              p: 1,
              border: '1px solid',
              // color: 'rgba(0, 0, 0, 0.20)', // same as TextField
              borderColor: 'rgba(0, 0, 0, 0.20)', // same as TextField
              borderRadius: '10px', // same as TextField
              transition: 'border-color 0.2s ease',
              width: '100%',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.80)',
                color: 'rgba(0, 0, 0, 0.80)', // darker on hover
              },
              '&:focus-within': {
                borderColor: 'black',
                color: 'black', // same as TextField
                // full black when an input is focused inside
              },
              gridColumn: 'spam 1',
            }}
            name={`experiences.${index}.isPresentlyWorking`}
            label="Working Here"
          />
          <Box sx={{ gridColumn: 'span 2', mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Job Responsibilities
            </Typography>
            {fields.map((field, k) => (
              <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Field.Text
                  name={`experiences.${index}.jobResponsibilities.${k}.value`}
                  label={`Responsibility ${k + 1}`}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton onClick={() => removeResponsibility(k)}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<Iconify icon="mdi:plus" />} onClick={() => append({ value: '' })}>
              Add Responsibility
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

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
      formState: { isSubmitting, errors },
      setValue,
      watch,
    } = methods;
    console.log(JSON.stringify(errors), 'error');
    const {
      fields: experienceFields,
      append: appendExperience,
      remove: removeExperience,
    } = useFieldArray({
      control,
      name: 'experiences',
    });

    const {
      fields: skillFields,
      append: appendSkill,
      remove: removeSkill,
    } = useFieldArray({
      control,
      name: 'skills',
    });

    const [inputSkillValue, setInputSkillValue] = useState('');

    const handleAddSkill = () => {
      const trimmed = inputSkillValue.trim();
      if (trimmed && !skillFields.some((s) => s.value === trimmed)) {
        appendSkill({ value: trimmed });
        setInputSkillValue('');
      }
    };

    const handleDeleteSkill = (index: number) => {
      removeSkill(index);
    };

    const {
      fields: languageFields,
      append: appendLanguage,
      remove: removeLanguage,
    } = useFieldArray({
      control,
      name: 'languages',
    });

    const [inputLanguageValue, setInputLanguageValue] = useState('');

    const handleAddLanguage = () => {
      const trimmed = inputLanguageValue.trim();
      if (trimmed && !languageFields.some((s) => s.value === trimmed)) {
        appendLanguage({ value: trimmed });
        setInputLanguageValue('');
      }
    };

    const handleDeleteLanguage = (index: number) => {
      removeLanguage(index);
    };

    const onSubmit = handleSubmit(async (data: any) => {
      try {
        console.log('resume data', data); // ✅ Store updated values

        await handleSaveInformation(
          data.briefSummary,
          data.experiences,
          data.skills,
          data.languages
        );
        // const prompt = generateResumeTextFromStudent(data);

        // setResumeStatus('Generated');

        toast.success('Resume saved! Click "Generate Resume" to preview.');
      } catch (e) {
        console.error(e);
        toast.error((e as Error)?.message);
      }
    });
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
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 4 }}>
              Experiences
            </Typography>
            {experienceFields.map((item, index) => (
              <ExperiencesItem
                key={item.id}
                control={control}
                index={index}
                remove={removeExperience}
              />
            ))}
            <Button
              variant="outlined"
              onClick={() =>
                appendExperience({
                  jobTitle: '',
                  companyName: '',
                  companyAddress: '',
                  startDate: '',
                  endDate: '',
                  jobResponsibilities: [],
                  isPresentlyWorking: false,
                })
              }
              sx={{
                gridColumn: 'span 2',
                width: '150px', // or any custom fixed width
                justifySelf: 'start',
              }}
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
              name="briefSummary"
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
            <Box sx={{ gridColumn: 'span 2' }}>
              <TextField
                fullWidth
                label="Add Skill"
                value={inputSkillValue}
                onChange={(e) => setInputSkillValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddSkill}>
                      <Iconify icon="mdi:plus" />
                    </IconButton>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                {skillFields.map((item, index) => (
                  <Chip
                    key={item.id}
                    label={item.value}
                    onDelete={() => handleDeleteSkill(index)}
                    color="primary"
                  />
                ))}
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
              Languages
            </Typography>
            <Box sx={{ gridColumn: 'span 2' }}>
              <TextField
                fullWidth
                label="Add Language"
                value={inputLanguageValue}
                onChange={(e) => setInputLanguageValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLanguage();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddLanguage}>
                      <Iconify icon="mdi:plus" />
                    </IconButton>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                {languageFields.map((item, index) => (
                  <Chip
                    key={item.id}
                    label={item.value}
                    onDelete={() => handleDeleteLanguage(index)}
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box>
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                height: 'auto',
                justifyContent: 'space-around',
                padding: 2,
                backgroundColor: theme.palette.background.default,
              }}
            >
              <Button
                type="submit"
                variant="outlined"
                disabled={isSubmitting}
                onClick={() => generateResumeTextFromStudent(watch)}
              >
                Update Resume via AI
              </Button>
              <Button type="submit" variant="outlined" disabled={isSubmitting} color="secondary">
                Save Information
              </Button>
              <Button variant="outlined" color="success" onClick={handleDownloadDocx}>
                Download Resume (DOCX)
              </Button>
            </Card>
          )}
        </Box>
      </Form>
    );
  }

  const generateResumeTextFromStudent = async (data) => {
    try {
      console.log(data());
      const res = await authAxiosInstance.post(endpoints.students.aiAssist(student?.id), data());
      toast.success('Updated Information with AI');
      onRefresh();
    } catch (e) {
      console.error(e);
      toast.error(e?.message);
    }
  };

  const handleSaveInformation = async (
    briefSummary: string,
    experiences: any[],
    skills: any[],
    languages: any[]
  ) => {
    setLoading(true);
    console.log('hcansadmksm');
    try {
      const payload = {
        experiences: experiences.map((i) => ({
          ...i,
          jobResponsibilities: i.jobResponsibilities.map((j) => j.value),
        })),
        professionalSummary: {
          briefSummary: briefSummary,
          skills: skills?.map((l) => l?.value),
          languages: languages?.map((l) => l?.value),
        },
      };
      const response = await authAxiosInstance.patch(
        endpoints.students.information(student?.id),
        payload
      );
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while generating the resume.');
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdate = async () => {
  //   try {
  //       // const payload = {
  //   //   experiences: [
  //   //     {
  //   //       jobTitle: "Software Developer",
  //   //       companyName: "Tech Corp Ltd",
  //   //       companyAddress: "",
  //   //       startDate: "07/05/2025",
  //   //       endDate: "11/06/2025",
  //   //       jobResponsibilities: [],
  //   //       isPresentlyWorking: false,
  //   //     },
  //   //     {
  //   //       jobTitle: "Senior Developer",
  //   //       companyName: "Innovation Labs",
  //   //       companyAddress: "456 Innovation Ave, Manchester, UK",
  //   //       startDate: "01/01/2024",
  //   //       jobResponsibilities: [
  //   //         "Leading development team of 5 developers",
  //   //         "Architecting scalable solutions",
  //   //         "Mentoring junior developers",
  //   //       ],
  //   //       isPresentlyWorking: true,
  //   //     },
  //   //   ],
  //   //   professionalSummary: {
  //   //     briefSummary: "Experienced software developer with 5+ years in full-stack development.",
  //   //     skills: ["JavaScript", "TypeScript", "React"],
  //   //     languages: [],
  //   //   },
  //   // };

  //     const response = await authAxiosInstance.patch<{ id: string }>(
  //       endpoints.students.information(currentStudent?.id || ''),
  //       payload
  //     );

  //     console.log('Updated Work History ID:', response.data.id);
  //   } catch (error: any) {
  //     console.error('Work History Update Failed:', error?.response?.data || error.message);
  //   }
  // };

  const handleDownloadDocx = async () => {
    const documentChildren = [];
    let resumeData = student;
    // --- Name and Contact Info ---
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.firstName + ' ' + resumeData.lastName,
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
            text: `${resumeData.phoneNumber}   ${resumeData.email}`,
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
    if (resumeData.professionalSummary.briefSummary) {
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
              text: resumeData.professionalSummary.briefSummary,
              size: 24,
              font: 'Arial',
            }),
          ],
          spacing: { after: 200 },
          indent: { left: 300 }, // Indent for content
        })
      );
    }

    // --- Experiences ---
    if (Array.isArray(resumeData.experiences) && resumeData.experiences.length > 0) {
      const exp = resumeData.experiences;

      console.log('resumeData.experiences', exp);
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Experiences',
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
      exp.forEach((job: any) => {
        console.log('exp job', job);

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
        const present = job.isPresentlyWorking;

        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${formatDateToDDMMYYYY(toDMY(job.startDate))} – ${
                  present ? 'Present' : formatDateToDDMMYYYY(toDMY(job.endDate))
                } | ${job.companyAddress}`,
                size: 22,
                font: 'Arial',
                color: '888888',
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 300 },
          })
        );

        if (Array.isArray(job.jobResponsibilities) && job.jobResponsibilities.length > 0) {
          job.jobResponsibilities.forEach((responsibility: any) => {
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
    if (
      Array.isArray(resumeData.professionalSummary.skills) &&
      resumeData.professionalSummary.skills.length > 0
    ) {
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
      const skillRuns = resumeData.professionalSummary.skills.map((skill: any, index: number) => {
        return new TextRun({
          text: `${skill}${index < resumeData.professionalSummary.skills.length - 1 ? ', ' : ''}`, // Join with comma and space
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
    if (resumeData.highestQualification) {
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

      if (resumeData.highestQualification) {
        const hq = resumeData.highestQualification;
        console.log('hq', hq);
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
                text: `Duration: ${formatDateToDDMMYYYY(toDMY(hq.startDate))} – ${formatDateToDDMMYYYY(toDMY(hq.endDate))}`,
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
    if (
      Array.isArray(resumeData.professionalSummary.languages) &&
      resumeData.professionalSummary.languages.length > 0
    ) {
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
      resumeData.professionalSummary.languages.forEach((lang: any) => {
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
    if (resumeData) {
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
      if (resumeData.dateOfBirth) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Date of Birth:', bold: true, size: 24, font: 'Arial' }),
              new TextRun({
                text: ` ${resumeData.dateOfBirth}`,
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 300 },
          })
        );
      }
      if (resumeData.sex) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Sex:', bold: true, size: 24, font: 'Arial' }),
              new TextRun({ text: ` ${resumeData.sex}`, size: 24, font: 'Arial' }),
            ],
            spacing: { after: 50 },
            indent: { left: 300 },
          })
        );
      }
      if (resumeData.nationality) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Nationality:', bold: true, size: 24, font: 'Arial' }),
              new TextRun({
                text: ` ${resumeData.nationality}`,
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

    const safeName = `${resumeData.firstName}_${resumeData.lastName}`
      .replace(/[^a-zA-Z0-9_ ]/g, '')
      .replace(/ /g, '_'); // Use fullName for filename, make it safer
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${safeName}_Resume.docx`);
  };

  const Resume = ({ resumeData }: { resumeData: IStudentsItem }) => {
    console.log('resumeData', resumeData);
    try {
      return (
        <Paper elevation={3} sx={{ m: 2, p: 2, borderRadius: 3 }}>
          {/* <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Resume Preview
          </Typography> */}
          <Box>
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
              {resumeData.firstName} {resumeData.lastName}
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
                {resumeData.phoneNumber}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '15px' }}>
                {resumeData.email}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '15px' }}>
                {resumeData.address}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} /> {/* Increased margin for better separation */}
            {/* briefSummary */}
            {resumeData?.professionalSummary?.briefSummary && (
              <Box sx={{ m: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Professional Summary
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '15px' }}>
                  {resumeData.professionalSummary.briefSummary}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            {/* Experiences */}
            {Array.isArray(resumeData?.experiences) && resumeData.experiences.length > 0 && (
              <Box sx={{ m: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Experiences
                </Typography>
                {resumeData.experiences.map((exp: any, i: number) => (
                  <Box key={i} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {exp.jobTitle} at {exp.companyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatDateToDDMMYYYY(toDate(exp.startDate))} –{' '}
                      {exp.isPresentlyWorking === true
                        ? 'Present'
                        : formatDateToDDMMYYYY(toDate(exp.endDate))}{' '}
                      | {exp.companyAddress}
                    </Typography>

                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      Responsibilities:
                      <br />
                      {exp.jobResponsibilities.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            {/* Skills */}
            {Array.isArray(resumeData?.professionalSummary?.skills) &&
              resumeData.professionalSummary.skills.length > 0 && (
                <Box sx={{ m: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Skills
                  </Typography>
                  <Grid container spacing={2}>
                    {resumeData.professionalSummary?.skills.map((skill: any, index: number) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box sx={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                          <GridCheckCircleIcon
                            sx={{ fontSize: 14, mr: 1, color: 'success.main' }}
                          />
                          {typeof skill === 'string' ? skill : skill?.value}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            <Divider sx={{ my: 2 }} />
            {/* Education */}
            {resumeData && (
              <Box sx={{ m: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Highest Qualification
                </Typography>
                {resumeData.highestQualification && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {/* **Highest Qualification:** */}
                      Institution: {resumeData.highestQualification.institutionName}
                      <br />
                      Duration:{' '}
                      {formatDateToDDMMYYYY(
                        toDate(resumeData?.highestQualification?.startDate)
                      )} – {formatDateToDDMMYYYY(toDate(resumeData.highestQualification.endDate))}
                      <br />
                      Grade: {resumeData.highestQualification.gradeResult}
                      <br />
                      Country: {resumeData.highestQualification.countryOfIssue}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            {/* Languages */}
            {Array.isArray(resumeData?.professionalSummary?.languages) &&
              resumeData.professionalSummary.languages.length > 0 && (
                <Box sx={{ m: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Languages
                  </Typography>
                  <Grid container spacing={2}>
                    {resumeData.professionalSummary.languages.map((lang: any, index: number) => (
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
            {resumeData && (
              <Box sx={{ m: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Personal Details
                </Typography>
                {resumeData?.dateOfBirth && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Typography component="span" fontWeight="bold">
                      Date of Birth:
                    </Typography>{' '}
                    {resumeData.dateOfBirth}
                  </Typography>
                )}
                {resumeData?.sex && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Typography component="span" fontWeight="bold">
                      Sex:
                    </Typography>{' '}
                    {resumeData.sex}
                  </Typography>
                )}
                {resumeData?.nationality && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Typography component="span" fontWeight="bold">
                      Nationality:
                    </Typography>{' '}
                    {resumeData.nationality}
                  </Typography>
                )}
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
          </Box>{' '}
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
            <ResumeBuilderForm defaultValues={defaultValues} />

            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                alignItems: 'center',
                height: 'auto',
                justifyContent: 'space-around',
                padding: 2,
                backgroundColor: theme.palette.grey[50],
              }}
            >
              <Resume resumeData={student} />
            </Card>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
