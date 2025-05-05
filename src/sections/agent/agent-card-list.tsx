import type { IAgentCard } from 'src/types/agent';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { AgentCard } from './agent-card';

// ----------------------------------------------------------------------

type Props = {
  agents: IAgentCard[];
};

export function AgentCardList({ agents }: Props) {
  const [page, setPage] = useState(1);

  const rowsPerPage = 12;

  const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        }}
      >
        {agents
          .slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
          .map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
      </Box>

      <Pagination
        page={page}
        shape="circular"
        count={Math.ceil(agents.length / rowsPerPage)}
        onChange={handleChangePage}
        sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
      />
    </>
  );
}
