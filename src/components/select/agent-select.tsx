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

import { fetchAgents } from 'src/services/agents/fetchAgents';

import type { AutocompleteBaseProps } from './city-select';

// ----------------------------------------------------------------------

type Value = string;

export type AgentSelectProps = AutocompleteBaseProps & {
  label?: string;
  error?: boolean;
  placeholder?: string;
  hiddenLabel?: boolean;
  getValue?: 'agentName' | 'agentId';
  helperText?: React.ReactNode;
  variant?: TextFieldProps['variant'];
};

type Agent = {
  id: string;
  firstName: string;
  lastName: string;
};

export function AgentSelect({
  id,
  label,
  error,
  variant,
  multiple,
  helperText,
  hiddenLabel,
  placeholder,
  getValue = 'agentName',
  ...other
}: AgentSelectProps) {
  const [agents, setAgents] = useState<Agent[]>([]);

  const getAgents = async () => {
    try {
      const { agents: a } = await fetchAgents('active'); // Update this as per your service
      setAgents(a);
    } catch (e) {
      console.error('Failed to fetch agents', e);
      toast.error('Failed to fetch agents');
      setAgents([]);
    }
  };

  useEffect(() => {
    getAgents();
  }, []);

  const options = useMemo(
    () =>
      agents.map((agt) =>
        getValue === 'agentName' ? ` ${agt?.firstName} ${agt?.lastName}` : agt.id
      ),
    [getValue, agents]
  );

  const getAgent = useCallback(
    (inputValue: string) => {
      const agt = agents.find(
        (a) => `${a?.firstName} ${a?.lastName}` === inputValue || a.id === inputValue
      );
      return {
        agentId: agt?.id || '',
        agentName: `${agt?.firstName} ${agt?.lastName}` || '',
      };
    },
    [agents]
  );

  const renderOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: Value) => {
      const agent = getAgent(option);
      return (
        <li {...props} key={agent.agentId}>
          {agent.agentName}
        </li>
      );
    },
    [getAgent]
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
        const agent = getAgent(option);

        return (
          <Chip
            {...getTagProps({ index })}
            key={agent.agentId}
            label={agent.agentName}
            size="small"
            variant="soft"
          />
        );
      }),
    [getAgent]
  );

  const getOptionLabel = useCallback(
    (option: Value) => {
      if (getValue === 'agentId') {
        const agent = agents.find((a) => a.id === option);
        return `${agent?.firstName ?? ''} ${agent?.lastName ?? ''}`;
      }
      return option;
    },
    [getValue, agents]
  );

  return (
    <Autocomplete
      id={`${id}-agent-select`}
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
