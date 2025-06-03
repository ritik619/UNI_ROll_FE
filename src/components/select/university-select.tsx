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

import { fetchUniversities } from 'src/services/universities/fetchUniversities';

import type { AutocompleteBaseProps } from './city-select';

// ----------------------------------------------------------------------

type Value = string;

export type UniversitySelectProps = AutocompleteBaseProps & {
  label?: string;
  error?: boolean;
  placeholder?: string;
  hiddenLabel?: boolean;
  getValue?: 'universityName' | 'universityId';
  helperText?: React.ReactNode;
  variant?: TextFieldProps['variant'];
};

type University = {
  id: string;
  name: string;
};

export function UniversitySelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = 'universityName',
  ...other
}: UniversitySelectProps) {
  const [universities, setUniversities] = useState<University[]>([]);

  const getUniversities = async () => {
    try {
      const { universities: u } = await fetchUniversities('active'); // Update this as per your service
      setUniversities(u);
    } catch (e) {
      console.error('Failed to fetch universities', e);
      toast.error('Failed to fetch universities');
      setUniversities([]);
    }
  };

  useEffect(() => {
    getUniversities();
  }, []);

  const options = useMemo(
    () => universities.map((univ) => (getValue === 'universityName' ? univ.name : univ.id)),
    [getValue, universities]
  );

  const getUniversity = useCallback(
    (inputValue: string) => {
      const univ = universities.find((u) => u.name === inputValue || u.id === inputValue);
      return {
        universityId: univ?.id || '',
        universityName: univ?.name || '',
      };
    },
    [universities]
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: Value) => {
      const university = getUniversity(option);
      return (
        <li {...props} key={university.universityId}>
          {university.universityName}
        </li>
      );
    },
    [getUniversity]
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
        const university = getUniversity(option);

        return (
          <Chip
            {...getTagProps({ index })}
            key={university.universityId}
            label={university.universityName}
            size="small"
            variant="soft"
          />
        );
      }),
    [getUniversity]
  );

  const getOptionLabel = useCallback(
    (option: Value) => {
      if (getValue === 'universityId') {
        const university = universities.find((u) => u.id === option);
        return university?.name ?? '';
      }
      return option;
    },
    [getValue, universities]
  );

  return (
    <Autocomplete
      id={`${id}-university-select`}
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
