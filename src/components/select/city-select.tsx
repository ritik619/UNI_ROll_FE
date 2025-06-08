import type { TextFieldProps } from '@mui/material/TextField';
import type {
  AutocompleteProps,
  AutocompleteRenderInputParams,
  AutocompleteRenderGetTagProps,
} from '@mui/material/Autocomplete';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { filledInputClasses } from '@mui/material/FilledInput';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { flagIconClasses } from 'src/components/flag-icon';

// ----------------------------------------------------------------------

type Value = string;

export type AutocompleteBaseProps = Omit<
  AutocompleteProps<any, boolean, boolean, boolean>,
  'options' | 'renderOption' | 'renderInput' | 'renderTags' | 'getOptionLabel'
>;

type City = {
  countryCode: string;
  countryName: string;
  id: string;
  name: string;
  state: string;
};

export type CitySelectProps = AutocompleteBaseProps & {
  label?: string;
  error?: boolean;
  placeholder?: string;
  hiddenLabel?: boolean;
  getValue?: 'name' | 'cityId';
  helperText?: React.ReactNode;
  variant?: TextFieldProps['variant'];
  countryCode?: string;
};

export function CitySelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = 'cityId',
  countryCode = '',
  ...other
}: CitySelectProps) {
  const [cities, setCities] = useState<City[]>([]);

  const getCities = async () => {
    try {
      const response = await authAxiosInstance.post(endpoints.location.cities, {
        countryCode,
      });
      setCities(response.data);
    } catch (e) {
      console.error('Failed to fetch cities', e);
      toast.error('Failed to fetch cities');
    }
  };
  useEffect(() => {
    if (countryCode) {
      getCities();
    }
  }, [countryCode]);

  const options = useMemo(
    () => cities.map((city) => (getValue === 'name' ? city.name : city?.id)),
    [getValue, cities]
  );
  const getCity = useCallback(
    (inputValue: string) => {
      const cityIndex = cities?.findIndex((op) => op.id === inputValue);
      const city = cities[cityIndex];
      return {
        name: city?.name || '',
        key: city?.id,
      };
    },
    [cities]
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: Value) => {
      const city = getCity(option);

      return (
        <li {...props} key={city.key}>
          {city.name}
        </li>
      );
    },
    [getCity]
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

      if (multiple) {
        return <TextField {...baseField} />;
      }

      return (
        <TextField
          {...baseField}
          slotProps={{
            input: {
              ...params.InputProps,
            },
          }}
          sx={{
            [`& .${outlinedInputClasses.root}`]: {
              [`& .${flagIconClasses.root}`]: { ml: 0.5, mr: -0.5 },
            },
            [`& .${filledInputClasses.root}`]: {
              [`& .${flagIconClasses.root}`]: { ml: 0.5, mr: -0.5, mt: hiddenLabel ? 0 : -2 },
            },
          }}
        />
      );
    },
    [getCity, label, variant, placeholder, helperText, hiddenLabel, error, multiple]
  );

  const renderTags = useCallback(
    (selected: Value[], getTagProps: AutocompleteRenderGetTagProps) =>
      selected.map((option, index) => {
        const city = getCity(option);

        return (
          <Chip
            {...getTagProps({ index })}
            key={city.key + city.name}
            label={city.name}
            size="small"
            variant="soft"
          />
        );
      }),
    [getCity]
  );

  const getOptionLabel = useCallback(
    (option: Value) => {
      if (getValue === 'cityId') {
        const country = cities.find((op) => op.id === option);
        return country?.name ?? '';
      }
      return option;
    },
    [getValue, cities]
  );

  return (
    <Autocomplete
      id={`${id}-city-select`}
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
