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
import { filledInputClasses } from '@mui/material/FilledInput';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { FlagIcon, flagIconClasses } from 'src/components/flag-icon';

import type { AutocompleteBaseProps } from './city-select';

// ----------------------------------------------------------------------

type Value = string;

export type CountrySelectProps = AutocompleteBaseProps & {
  label?: string;
  error?: boolean;
  placeholder?: string;
  hiddenLabel?: boolean;
  getValue?: 'name' | 'code';
  helperText?: React.ReactNode;
  variant?: TextFieldProps['variant'];
};
type Country = {
  code: string;
  flag: string;
  name: string;
  phone: string;
};

export function CountrySelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = 'name',
  ...other
}: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  // const countries=City.getCitiesOfCountry('IN');

  const getCountries = async () => {
    try {
      const cachedCountries = localStorage.getItem(`countries`);
      if (cachedCountries) {
        const data = JSON.parse(cachedCountries);
        setCountries(data); // Use cached data if available
      } else {
        const response = await authAxiosInstance.get(endpoints.location.countries);
        setCountries(response.data);
        localStorage.setItem(`countries`, JSON.stringify(response.data)); // Cache data
      }
    } catch (e) {
      console.error('Failed to fetch countries', e);
      toast.error('Failed to fetch countries');
    }
  };
  useEffect(() => {
    getCountries();
  }, []);
  const options = useMemo(
    () => countries.map((country) => (getValue === 'name' ? country.name : country.code)),
    [getValue, countries]
  );
  const getCountry = useCallback(
    (inputValue: string) => {
      const country = countries.find(
        (op) => op.name === inputValue || op.code === inputValue || op.phone === inputValue
      );
      return {
        code: country?.code || '',
        name: country?.name || '',
        phone: country?.phone || '',
      };
    },
    [countries]
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: Value) => {
      const country = getCountry(option);

      return (
        <li {...props} key={country.name}>
          <FlagIcon
            key={country.name}
            code={country.code}
            sx={{
              mr: 1,
              width: 22,
              height: 22,
              borderRadius: '50%',
            }}
          />
          {country.name} ({country.code}) +{country.phone}
        </li>
      );
    },
    [getCountry]
  );

  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => {
      const country = getCountry(params.inputProps.value as Value);

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
              startAdornment: (
                <InputAdornment position="start" sx={{ ...(!country.code && { display: 'none' }) }}>
                  <FlagIcon
                    key={country.name}
                    code={country.code}
                    sx={{ width: 22, height: 22, borderRadius: '50%' }}
                  />
                </InputAdornment>
              ),
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
    [getCountry, label, variant, placeholder, helperText, hiddenLabel, error, multiple]
  );

  const renderTags = useCallback(
    (selected: Value[], getTagProps: AutocompleteRenderGetTagProps) =>
      selected.map((option, index) => {
        const country = getCountry(option);

        return (
          <Chip
            {...getTagProps({ index })}
            key={country.name}
            label={country.name}
            size="small"
            variant="soft"
            icon={
              <FlagIcon
                key={country.name}
                code={country.code}
                sx={{ width: 16, height: 16, borderRadius: '50%' }}
              />
            }
          />
        );
      }),
    [getCountry]
  );

  const getOptionLabel = useCallback(
    (option: Value) => {
      if (getValue === 'code') {
        const country = countries.find((op) => op.code === option);
        return country?.name ?? '';
      }
      return option;
    },
    [getValue, countries]
  );

  return (
    <Autocomplete
      id={`${id}-country-select`}
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
