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
  student: currentStudent,
  onRefresh,
}: {
  student: IStudentsItem;
  onRefresh: () => void;
}) {
  const [resumeJSON, setResumeJSON] = useState<{
    briefSummary: string;
    skills: string[];
    workHistory: any[];
  }>();
  const [loading, setLoading] = useState(false);
  const [resumeStatus, setResumeStatus] = useState<'NotGenerated' | 'Generated'>('NotGenerated');
  const theme = useTheme();
  const [student, setStudent] = useState(currentStudent);
  const ResumeSchema = zod.object({
    workHistory: zod
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
    personalStatement: zod.string().optional(),
    skills: zod.array(zod.object({ value: zod.string().optional() })).optional(),
    languages: zod.array(zod.object({ value: zod.string().optional() })).optional(),
  });

  type ResumeFormValues = zod.infer<typeof ResumeSchema>;

  const defaultValues = {
    // firstName: student.firstName,
    // lastName: student.lastName,
    // dateOfBirth: toDMY(student?.dateOfBirth).toDateString(),
    // sex: student.sex,
    // phoneNumber: student.phoneNumber,
    // email: student.email,
    // address: student.address,
    // nationality: student.nationality,
    // universityName: student.universityName,
    // courseName: student.courseName,
    highestQualification: {
      startDate: dayjs(toDMY(student?.highestQualification?.startDate)) || '',
      endDate: dayjs(toDMY(student?.highestQualification?.endDate)) || '',
      gradeResult: student?.highestQualification?.gradeResult || '',
      institutionName: student?.highestQualification?.institutionName || '',
      countryOfIssue: student?.highestQualification?.countryOfIssue || '',
    },
    workHistory: student?.workHistory
      ? student?.workHistory?.map((i) => ({
        ...i,
        jobResponsibilities: i.jobResponsibilities.map((j) => ({ value: j })),
        startDate: dayjs(toDMY(i.startDate)),
        isPresentlyWorking: i?.isPresentlyWorking ? true : false,
        ...(i?.isPresentlyWorking ? {} : i?.endDate && { endDate: dayjs(toDMY(i.endDate)) }),
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
    personalStatement: student?.personalStatement || '',
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
      name: `workHistory.${index}.jobResponsibilities`,
    });
    const isWorking = useWatch({
      control,
      name: `workHistory.${index}.isPresentlyWorking`,
    });
    console.log({ isWorking })
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          gridColumn: 'span 2',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
          }}
        >
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

        {/* Fields */}
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
            },
          }}
        >
          <Field.Text name={`workHistory.${index}.jobTitle`} label="Job Title" />
          <Field.Text name={`workHistory.${index}.companyName`} label="Company Name" />
          <Field.Text
            name={`workHistory.${index}.companyAddress`}
            label="Company Address"
            sx={{ gridColumn: 'span 2' }}
          />

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gridColumn: 'span 2',
            }}
          >
            <Field.DatePicker name={`workHistory.${index}.startDate`} label="Start Date" />
            {!isWorking && (
              <Field.DatePicker name={`workHistory.${index}.endDate`} label="End Date" />
            )}
            <Field.Checkbox
              name={`workHistory.${index}.isPresentlyWorking`}
              label="Working Here"
              sx={{
                p: 1.5,
                border: '1px solid rgba(0, 0, 0, 0.20)',
                borderRadius: 2,
                transition: 'border-color 0.2s ease',
                width: '100%',
                '&:hover': {
                  borderColor: 'rgba(0, 0, 0, 0.6)',
                },
                '&:focus-within': {
                  borderColor: 'black',
                },
              }}
            />
          </Box>
        </Box>

        {/* Responsibilities */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Job Responsibilities
          </Typography>
          {fields.map((field, k) => (
            <Box
              key={field.id}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                gap: 1,
                mb: 1,
              }}
            >
              <Field.Text
                name={`workHistory.${index}.jobResponsibilities.${k}.value`}
                label={`Responsibility ${k + 1}`}
                sx={{ flexGrow: 1 }}
              />
              <IconButton onClick={() => removeResponsibility(k)}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => append({ value: '' })}
            sx={{ mt: 1 }}
          >
            Add Responsibility
          </Button>
        </Box>
      </Box>
    );
  }

  function ResumeBuilderForm({ defaultValues }: { defaultValues: ResumeFormValues }) {
    const theme = useTheme();
    const methods = useForm<ResumeFormValues>({
      resolver: zodResolver(ResumeSchema),
      defaultValues,
      mode: 'onChange',
    });

    const {
      control,
      handleSubmit,
      formState: { isSubmitting, errors },
      setValue,
      watch,
    } = methods;
    const {
      fields: experienceFields,
      append: appendExperience,
      remove: removeExperience,
    } = useFieldArray({
      control,
      name: 'workHistory',
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
        await handleSaveInformation(
          data.briefSummary,
          data.personalStatement,
          data.workHistory,
          data.skills,
          data.languages,
        );
        toast.success('CV saved! Click "Generate CV" to preview.');
      } catch (e) {
        console.error(e);
        toast.error((e as Error)?.message);
      }
    });
    return (
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>

        {/* CV Resume Builder Form */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              // alignItems: 'center',
              width: '100%',
              mx: 'auto',
              m: 1,
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
            }}
          >

            {/* Summary */}
            <Box
              sx={{
                m: 1,
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
              }}
            >
              <Typography variant="subtitle1" sx={{ gridColumn: 'span 2' }}>
                Professional Summary
              </Typography>
              <Field.Text
                name="briefSummary"
                label="Brief Summary"
                rows={4}
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>

            {/* Experiences Section */}
            <Box
              sx={{
                m: 1,

                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
              }}
            >
              <Typography variant="subtitle1" sx={{ gridColumn: 'span 2' }}>
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
                  width: { xs: '100%', sm: '150px' },
                  justifySelf: 'start',
                }}
              >
                Add Experience
              </Button>
            </Box>

            {/* Skills */}
            <Box
              sx={{
                m: 1,
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
              }}
            >
              <Typography variant="subtitle1" sx={{ gridColumn: 'span 2' }}>
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

            {/* Languages */}
            {/* <Box
            sx={{
              mt: 4,
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
            }}
          >
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2' }}>
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
          </Box> */}
          </Card>

        </Box>

        {/* Personal Statement */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Card
            sx={{
              display: 'flex',
              width: '100%',
              mx: 'auto',
              m: 1,
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
            }}
          >
            {/* Personal Statement */}
            <Box
              sx={{
                m: 1,
                width: '100%',
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
              }}
            >
              <Typography variant="subtitle1" sx={{ gridColumn: 'span 2' }}>
                Personal Statement
              </Typography>
              <Field.Text
                name="personalStatement"
                label="Personal Statement"
                multiline
                sx={{
                  gridColumn: 'span 2',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem',
                }}
              />
            </Box>
          </Card>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              // alignItems: 'center',
              width: '100%',
              // mx: 'auto',
              m: 1,
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Stack
                spacing={2}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  // type="submit"
                  variant="outlined"
                  disabled={isSubmitting}
                  color="secondary"
                  onClick={() => generateResumeTextFromStudent(watch, setValue)}
                  fullWidth
                >
                  Update CV via AI
                </Button>
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={isSubmitting}
                  color="info"
                  fullWidth
                >
                  Save Information & Preview
                </Button>
                <Button variant="outlined" color="success" onClick={handleDownloadDocx} fullWidth>
                  Download CV (DOCX)
                </Button>
              </Stack>
            )}
          </Card>

        </Box>
           
      </Form>
    );
  }
  const formateData = (data: any) => {
    const updated = { ...data };

    // 1. Skills
    if (Array.isArray(updated.skills)) {
      updated.skills = updated.skills.map((skill: any) => skill.value);
    }

    // 2. Languages - capitalize first letter
    if (Array.isArray(updated.languages)) {
      updated.languages = updated.languages.map((lang: any) => {
        const str = lang.value?.toString().trim();
        return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
      });
    }

    // 3. Job Responsibilities
    if (Array.isArray(updated.workHistory)) {
      updated.workHistory = updated.workHistory.map((exp: any) => ({
        ...exp,
        jobResponsibilities: Array.isArray(exp.jobResponsibilities)
          ? exp.jobResponsibilities.map((resp: any) => resp.value)
          : [],
      }));
    }

    return updated;
  };

  const generateResumeTextFromStudent = async (watch: any, setValue: any) => {
    try {
      const watcher = watch();
      const formatted = formateData(watcher);

      const payload = {
        ...formatted,
        experiences: formatted.workHistory,
        personalStatement: formatted.personalStatement,
      };
      delete payload.workHistory;

      if (!payload?.highestQualification?.institutionName) {
        delete payload?.highestQualification;
      }

      const { data } = await authAxiosInstance.post(
        endpoints.students.aiAssist(student?.id),
        payload
      );

      toast.success('Updated Information with AI');
      const languages = data.professionalSummary?.languages?.map((i) => ({ value: i }));
      const workHistory = data?.workHistory?.map((i: any, idx: number) => {
        const original = formatted.workHistory?.[idx];
        const isPresentlyWorking = original?.isPresentlyWorking ?? false;

        return {
          ...i,
          isPresentlyWorking,
          jobResponsibilities: i.jobResponsibilities.map((j: any) => ({ value: j })),
          startDate: dayjs(toDMY(i.startDate)),
          ...(isPresentlyWorking ? {} : i?.endDate && { endDate: dayjs(toDMY(i.endDate)) }),
        };
      });
      const professionalSummary = {
        briefSummary: data.professionalSummary?.briefSummary,
        skills: data.professionalSummary?.skills?.map((i) => ({ value: i })),
        languages,
      };

      setValue('personalStatement', data.personalStatement);
      setValue('workHistory', workHistory);
      setValue('briefSummary', professionalSummary.briefSummary);
      setValue('skills', professionalSummary.skills);
      setValue('languages', professionalSummary.languages);
    } catch (e) {
      console.error(e);
      toast.error((e instanceof Error && e.message) || 'Something went wrong');
    }
  };

  const handleSaveInformation = async (
    briefSummary: string,
    personalStatement: string,
    workHistory: any[],
    skills: any[],
    languages: any[]
  ) => {
    // setLoading(true);
    console.log('hcansadmksm');
    try {
      const payload = {
        experiences: workHistory.map((i) => ({
          ...i,
          jobResponsibilities: i.jobResponsibilities.map((j) => j.value),
        })),
        professionalSummary: {
          briefSummary: briefSummary,
          skills: skills?.map((l) => l?.value),
          languages: languages?.map((l) => l?.value),
        },
        // personalStatement,
      };
      const response = await authAxiosInstance.patch(
        endpoints.students.information(student?.id),
        payload
      );
      setStudent(response.data)
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while generating the resume.');
    } finally {
      console.log(student);
      // setLoading(false);
    }
  };



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

    // --- Personal Statement ---
    // if (resumeData?.professionalSummary?.briefSummary) {
    //   documentChildren.push(
    //     new Paragraph({
    //       children: [
    //         new TextRun({
    //           text: 'Personal Statement',
    //           bold: true, // Make section titles bold
    //           size: 28, // Corresponds to 14pt
    //           font: 'Arial',
    //         }),
    //       ],
    //       spacing: { before: 300, after: 150 },
    //       indent: { left: 300 }, // Indent for the title
    //     })
    //   );
    //   documentChildren.push(
    //     new Paragraph({
    //       border: {
    //         bottom: {
    //           color: 'auto',
    //           space: 1,
    //           style: 'single',
    //           size: 6,
    //         },
    //       },
    //       spacing: { after: 150 },
    //     })
    //   );
    //   documentChildren.push(
    //     new Paragraph({
    //       children: [
    //         new TextRun({
    //           text: resumeData.professionalSummary.briefSummary,
    //           size: 24,
    //           font: 'Arial',
    //         }),
    //       ],
    //       spacing: { after: 200 },
    //       indent: { left: 300 }, // Indent for content
    //     })
    //   );
    // }
    // --- Professional Summary ---
    if (resumeData?.professionalSummary?.briefSummary) {
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
    if (Array.isArray(resumeData.workHistory) && resumeData.workHistory.length > 0) {
      const exp = resumeData.workHistory;

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
                text: `${formatDateToDDMMYYYY(toDMY(job.startDate))} – ${present ? 'Present' : formatDateToDDMMYYYY(toDMY(job.endDate))
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
      Array.isArray(resumeData?.professionalSummary?.skills) &&
      resumeData?.professionalSummary?.skills?.length > 0
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
          text: `${skill}${index < resumeData.professionalSummary?.skills?.length - 1 ? ', ' : ''}`, // Join with comma and space
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

    // --- Personal Details ---
    // if (resumeData) {
    //   documentChildren.push(
    //     new Paragraph({
    //       children: [
    //         new TextRun({
    //           text: 'Personal Details',
    //           bold: true,
    //           size: 28,
    //           font: 'Arial',
    //         }),
    //       ],
    //       spacing: { before: 300, after: 150 },
    //       indent: { left: 300 },
    //     })
    //   );
    //   documentChildren.push(
    //     new Paragraph({
    //       border: {
    //         bottom: {
    //           color: 'auto',
    //           space: 1,
    //           style: 'single',
    //           size: 6,
    //         },
    //       },
    //       spacing: { after: 150 },
    //     })
    //   );
    //   if (resumeData.dateOfBirth) {
    //     documentChildren.push(
    //       new Paragraph({
    //         children: [
    //           new TextRun({ text: 'Date of Birth:', bold: true, size: 24, font: 'Arial' }),
    //           new TextRun({
    //             text: ` ${resumeData.dateOfBirth}`,
    //             size: 24,
    //             font: 'Arial',
    //           }),
    //         ],
    //         spacing: { after: 50 },
    //         indent: { left: 300 },
    //       })
    //     );
    //   }
    //   if (resumeData.sex) {
    //     documentChildren.push(
    //       new Paragraph({
    //         children: [
    //           new TextRun({ text: 'Sex:', bold: true, size: 24, font: 'Arial' }),
    //           new TextRun({ text: ` ${resumeData.sex}`, size: 24, font: 'Arial' }),
    //         ],
    //         spacing: { after: 50 },
    //         indent: { left: 300 },
    //       })
    //     );
    //   }
    //   if (resumeData.nationality) {
    //     documentChildren.push(
    //       new Paragraph({
    //         children: [
    //           new TextRun({ text: 'Nationality:', bold: true, size: 24, font: 'Arial' }),
    //           new TextRun({
    //             text: ` ${resumeData.nationality}`,
    //             size: 24,
    //             font: 'Arial',
    //           }),
    //         ],
    //         spacing: { after: 200 },
    //         indent: { left: 300 },
    //       })
    //     );
    //   }
    // }

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
        if (hq.startDate && hq.endDate) {
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
        }
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
      Array.isArray(resumeData.professionalSummary?.languages) &&
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
        <Card
        // sx={{
        //   display: 'flex',
        //   flexDirection: 'column',
        //   alignItems: 'center',
        //   width: '100%',
        //   mx: 'auto',
        //   my: 2,s
        //   borderRadius: 3,
        //   p: { xs: 2, sm: 3 },
        // }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              p: { xs: 2, sm: 4 },
              backgroundColor: theme.palette.background.default,
            }}
          >
            {/* Full Name */}
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{ color: theme.palette.text.primary }}
            >
              {resumeData.firstName} {resumeData.lastName}
            </Typography>

            {/* Contact Info */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <Typography variant="body2">{resumeData.phoneNumber}</Typography>
              <Typography variant="body2">{resumeData.email}</Typography>
              <Typography variant="body2">{resumeData.address}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Professional Summary */}
            {resumeData?.professionalSummary?.briefSummary && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Professional Summary
                </Typography>
                <Typography variant="body2">
                  {resumeData.professionalSummary.briefSummary}
                </Typography>
              </Box>
            )}

            {/* Experiences */}
            {Array.isArray(resumeData?.workHistory) && resumeData.workHistory.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Experiences
                </Typography>
                {resumeData.workHistory.map((exp: any, i: number) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {exp.jobTitle} at {exp.companyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatDateToDDMMYYYY(toDate(exp.startDate))} –{' '}
                      {exp.isPresentlyWorking
                        ? 'Present'
                        : formatDateToDDMMYYYY(toDate(exp.endDate))}{' '}
                      | {exp.companyAddress}
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                      {exp.jobResponsibilities.map((item: string, index: number) => (
                        <li key={index}>
                          <Typography variant="body2">{item}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Skills */}
            {Array.isArray(resumeData?.professionalSummary?.skills) &&
              resumeData.professionalSummary.skills.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Skills
                  </Typography>
                  <Grid container spacing={2}>
                    {resumeData.professionalSummary.skills.map((skill: any, index: number) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <GridCheckCircleIcon
                            sx={{ fontSize: 16, color: 'success.main', mr: 1 }}
                          />
                          <Typography variant="body2">
                            {typeof skill === 'string' ? skill : skill?.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

            {/* Education */}
            {resumeData.highestQualification && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Highest Qualification
                </Typography>
                <Typography variant="body2">
                  Institution: {resumeData.highestQualification.institutionName}
                  <br />
                  {resumeData.highestQualification.startDate && resumeData.highestQualification.endDate && (
                    <>
                      Duration:{' '}
                      {formatDateToDDMMYYYY(toDate(resumeData.highestQualification.startDate))} –{' '}
                      {formatDateToDDMMYYYY(toDate(resumeData.highestQualification.endDate))}
                      <br />
                    </>
                  )}
                  Grade: {resumeData.highestQualification.gradeResult}
                  <br />
                  Country: {resumeData.highestQualification.countryOfIssue}
                </Typography>
              </Box>
            )}

            {/* Languages
            {Array.isArray(resumeData?.professionalSummary?.languages) &&
              resumeData.professionalSummary.languages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Languages
                  </Typography>
                  <Grid container spacing={2}>
                    {resumeData.professionalSummary.languages.map((lang: any, index: number) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <GridCheckCircleIcon
                            sx={{ fontSize: 16, color: 'success.main', mr: 1 }}
                          />
                          <Typography variant="body2">
                            {typeof lang === 'string' ? lang : lang?.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )} */}

            {/* Personal Details */}
            {/* <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Personal Details
              </Typography>
              {resumeData?.dateOfBirth && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Date of Birth:</strong> {resumeData.dateOfBirth}
                </Typography>
              )}
              {resumeData?.sex && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Sex:</strong> {resumeData.sex}
                </Typography>
              )}
              {resumeData?.nationality && (
                <Typography variant="body2">
                  <strong>Nationality:</strong> {resumeData.nationality}
                </Typography>
              )}
            </Box> */}
          </Paper>
        </Card>
      );
    } catch (e) {
      return <Typography color="error">Invalid resume data</Typography>;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        // maxWidth: 1000,
      }}
    >
      <Typography variant="h4">CV Builder</Typography>
      {student?.highestQualification?.institutionName ? null : <Typography variant="caption">You've not added any highest qualification.Please add them by editing student**</Typography>}
      <ResumeBuilderForm defaultValues={defaultValues} />
      <Resume resumeData={student} />
    </Box>
  );
}
