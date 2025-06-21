// components/ResumeBuilderForm.tsx
import { useEffect } from 'react';
import { Box, TextField, Chip, IconButton, Typography, Button } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { ResumeSchema } from '../hooks/hooks-students-resume-builder';
import { IStudentsItem } from 'src/types/students';

interface ResumeBuilderFormProps {
    student: IStudentsItem;
    resumeData: IStudentsItem;
    setResumeData: (data: IStudentsItem) => void;
}

export function ResumeBuilderForm({ student, resumeData, setResumeData }: ResumeBuilderFormProps) {
    const methods = useForm<IStudentsItem>({
        resolver: zodResolver(ResumeSchema),
        defaultValues: resumeData,
        mode: 'onChange',
    });

    const {
        control,
        watch,
        getValues,
    } = methods;

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control,
        name: 'skills',
    });

    const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({
        control,
        name: 'languages',
    });

    const {
        fields: experienceFields,
        append: appendExperience,
        remove: removeExperience,
    } = useFieldArray({
        control,
        name: 'experiences',
    });

    const experienceResponsibilityArrays = experienceFields.map((_, index) =>
        useFieldArray({
            control,
            name: `experiences.${index}.jobResponsibilities`,
        })
    );

    const onChange = () => {
        setResumeData(getValues());
    };

    useEffect(() => {
        const subscription = watch(onChange);
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <Form methods={methods}>
            {/* Summary */}
            <Box>
                <Typography variant="subtitle1" sx={{ mt: 3 }}>
                    Professional Summary
                </Typography>
                <Field.Text name="briefSummary" label="Brief Summary" multiline rows={4} />
            </Box>

            {/* Experiences */}
            <Box
                sx={{
                    display: 'grid',
                    rowGap: 3,
                    columnGap: 2,
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                    mt: 4,
                }}
            >
                <Typography variant="subtitle1" sx={{ gridColumn: 'span 2' }}>
                    Experiences
                </Typography>

                {experienceFields.map((item, index) => {
                    const fieldName = `experiences.${index}`;
                    const experiences = watch('experiences');
                    const responsibilitiesArray = experienceResponsibilityArrays[index];
                    const isWorking = experiences?.[index]?.isPresentlyWorking;

                    return (
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle2">Experience #{index + 1}</Typography>
                                {index > 0 && (
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => removeExperience(index)}
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
                                <Field.Text name={`${fieldName}.jobTitle`} label="Job Title" />
                                <Field.Text name={`${fieldName}.companyName`} label="Company Name" />
                                <Field.Text
                                    name={`${fieldName}.companyAddress`}
                                    label="Company Address"
                                    sx={{ gridColumn: 'span 2' }}
                                />
                                <Field.DatePicker name={`${fieldName}.startDate`} label="Start Date" />
                                {!isWorking && (
                                    <Field.DatePicker name={`${fieldName}.endDate`} label="End Date" />
                                )}
                                <Field.Checkbox
                                    name={`${fieldName}.isPresentlyWorking`}
                                    label="Working Here"
                                    sx={{
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'rgba(0, 0, 0, 0.20)',
                                        borderRadius: '10px',
                                        width: '100%',
                                        '&:hover': {
                                            borderColor: 'rgba(0, 0, 0, 0.80)',
                                            color: 'rgba(0, 0, 0, 0.80)',
                                        },
                                        '&:focus-within': {
                                            borderColor: 'black',
                                            color: 'black',
                                        },
                                        gridColumn: 'span 1',
                                    }}
                                />
                            </Box>

                            {/* Responsibilities */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Job Responsibilities
                                </Typography>
                                {(responsibilitiesArray.fields || []).map((rField, k) => (
                                    <Box key={rField.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Field.Text
                                            name={`${fieldName}.jobResponsibilities.${k}.value`}
                                            label={`Responsibility ${k + 1}`}
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <IconButton onClick={() => responsibilitiesArray.remove(k)}>
                                            <Iconify icon="solar:trash-bin-trash-bold" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    startIcon={<Iconify icon="mdi:plus" />}
                                    onClick={() => responsibilitiesArray.append({ value: '' })}
                                >
                                    Add Responsibility
                                </Button>
                            </Box>
                        </Box>
                    );
                })}

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
                        width: '150px',
                        justifySelf: 'start',
                    }}
                >
                    Add Experience
                </Button>
            </Box>

            {/* Skills */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Skills</Typography>
                <TextField
                    label="Add Skill"
                    onKeyDown={(e) => {
                        const input = e.target as HTMLInputElement;
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = input.value.trim();
                            if (val) {
                                appendSkill({ value: val });
                                input.value = '';
                            }
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <IconButton>
                                <Iconify icon="mdi:plus" />
                            </IconButton>
                        ),
                    }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                    {(skillFields as any[]).map((item, i) => (
                        <Chip key={item.id} label={item.value} onDelete={() => removeSkill(i)} />
                    ))}
                </Box>
            </Box>

            {/* Languages */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Languages</Typography>
                <TextField
                    label="Add Language"
                    onKeyDown={(e) => {
                        const input = e.target as HTMLInputElement;
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = input.value.trim();
                            if (val) {
                                appendLang({ value: val });
                                input.value = '';
                            }
                        }
                    }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
                    {(langFields as any[]).map((item, i) => (
                        <Chip key={item.id} label={item.value} onDelete={() => removeLang(i)} />
                    ))}
                </Box>
            </Box>
        </Form>
    );
}
