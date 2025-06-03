import type { TextFieldProps } from '@mui/material/TextField';
import type {
  AutocompleteRenderInputParams,
  AutocompleteRenderGetTagProps,
} from '@mui/material/Autocomplete';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import type { AutocompleteBaseProps } from './city-select';
import { fetchCourses } from 'src/services/courses/fetchCourses';

// ----------------------------------------------------------------------

type Value = string;

export type CourseSelectProps = AutocompleteBaseProps & {
  label?: string;
  error?: boolean;
  placeholder?: string;
  hiddenLabel?: boolean;
  getValue?: 'courseName' | 'courseId';
  helperText?: React.ReactNode;
  variant?: TextFieldProps['variant'];
};

type Course = {
  id: string;
  code: string;
  name: string;
};

export function CourseSelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = 'courseName',
  ...other
}: CourseSelectProps) {
  const [courses, setCourses] = useState<Course[]>([]);

  const getCourses = async () => {
    try {
      const { courses: c } = await fetchCourses('active'); // update this endpoint
      console.log('Courses response:', c);
      setCourses(c);
    } catch (e) {
      console.error('Failed to fetch courses', e);
      toast.error('Failed to fetch courses');
      setCourses([]);
    }
  };

  useEffect(() => {
    console.log('Fetching courses...');
    getCourses();
  }, []);

  const options = useMemo(
    () => courses?.map((course) => (getValue === 'courseName' ? course.name : course.id)),
    [getValue, courses]
  );

  const getCourse = useCallback(
    (inputValue: string) => {
      const course = courses.find((c) => c.name === inputValue || c.id === inputValue);
      return {
        courseId: course?.id || '',
        courseName: course?.name || '',
      };
    },
    [courses]
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: Value) => {
      const course = getCourse(option);
      return (
        <li {...props} key={course.courseId}>
          {course.courseName}
        </li>
      );
    },
    [getCourse]
  );

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => {
      const baseField = {
        ...params,
        label,
        variant,
        placeholder,
        helperText,
        hiddenLabel,
        error: !!error,
        inputProps: { ...params.inputProps, autoComplete: 'new-password' },
      };

      return <TextField {...baseField} />;
    },
    [label, variant, placeholder, helperText, hiddenLabel, error]
  );

  const renderTags = useCallback(
    (selected: Value[], getTagProps: AutocompleteRenderGetTagProps) =>
      selected.map((option, index) => {
        const course = getCourse(option);

        return (
          <Chip
            {...getTagProps({ index })}
            key={course.courseId}
            label={course.courseName}
            size="small"
            variant="soft"
          />
        );
      }),
    [getCourse]
  );

  const getOptionLabel = useCallback(
    (option: Value) => {
      if (getValue === 'courseId') {
        const course = courses.find((c) => c.id === option);
        return course?.name ?? '';
      }
      return option;
    },
    [getValue, courses]
  );

  return (
    <Autocomplete
      id={`${id}-course-select`}
      multiple={multiple}
      options={options}
      autoHighlight={!multiple}
      disableCloseOnSelect={multiple}
      renderOption={renderOption}
      renderInput={renderInput}
      renderTags={multiple ? renderTags : undefined}
      getOptionLabel={getOptionLabel}
      {...other}
    />
  );
}
