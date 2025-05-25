
import type { CitySelectProps } from 'src/components/select';

import { Controller, useFormContext } from 'react-hook-form';

import { CitySelect } from 'src/components/select';
// ----------------------------------------------------------------------

export type RHFCitySelectProps = CitySelectProps & {
  name: string;
};

export function RHFCitySelect({ name, helperText, ...other }: RHFCitySelectProps) {
  const { control, setValue } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <CitySelect
          id={`${name}-rhf-city-select`}
          value={field.value}
          onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
          error={!!error}
          helperText={error?.message ?? helperText}
          {...other}
        />
      )}
    />
  );
}
