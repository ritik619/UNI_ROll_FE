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

import { fetchIntakes } from 'src/services/Intakes/fetchIntakes';

import type { AutocompleteBaseProps } from './city-select';

// ----------------------------------------------------------------------

type Value = string;

export type IntakeSelectProps = AutocompleteBaseProps & {
  label?: string;
  error?: boolean;
  placeholder?: string;
  hiddenLabel?: boolean;
  getValue?: 'intakeId' | 'intakeName';
  helperText?: React.ReactNode;
  variant?: TextFieldProps['variant'];
};

type Intake = {
  id: string;
  name: string;
};

export function IntakeSelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = 'intakeName',
  ...other
}: IntakeSelectProps) {
  const [intakes, setIntakes] = useState<Intake[]>([]);

  const getIntakes = async () => {
    try {
      const { intakes: u } = await fetchIntakes('active'); // Update this as per your service
      setIntakes(u);
    } catch (e) {
      console.error('Failed to fetch intakes', e);
      toast.error('Failed to fetch intakes');
      setIntakes([]);
    }
  };

  useEffect(() => {
    getIntakes();
  }, []);

  const options = useMemo(
    () => intakes.map((univ) => (getValue === 'intakeName' ? univ.name : univ.id)),
    [getValue, intakes]
  );

  const getIntake = useCallback(
    (inputValue: string) => {
      const univ = intakes.find((u) => u.name === inputValue || u.id === inputValue);
      return {
        intakeId: univ?.id || '',
        intakeName: univ?.name || '',
      };
    },
    [intakes]
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: Value) => {
      const intake = getIntake(option);
      return (
        <li {...props} key={intake.intakeId}>
          {intake.intakeName})
        </li>
      );
    },
    [getIntake]
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
        const intake = getIntake(option);

        return (
          <Chip
            {...getTagProps({ index })}
            key={intake.intakeId}
            label={intake.intakeName}
            size="small"
            variant="soft"
          />
        );
      }),
    [getIntake]
  );

  const getOptionLabel = useCallback(
    (option: Value) => {
      if (getValue === 'intakeId') {
        const intake = intakes.find((u) => u.id === option);
        return intake?.name ?? '';
      }
      return option;
    },
    [getValue, intakes]
  );

  return (
    <Autocomplete
      id={`${id}-intake-select`}
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
