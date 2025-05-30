import type { IStudentsCard } from 'src/types/students';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { StudentsCard } from './students-card';

// ----------------------------------------------------------------------

type Props = {
  user: IStudentsCard[];
};

export function StudentsCardList({ user }: Props) {
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
        {user.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage).map(() => (
          <StudentsCard key={user.id} students={user} />
        ))}
      </Box>

      <Pagination
        page={page}
        shape="circular"
        count={Math.ceil(user.length / rowsPerPage)}
        onChange={handleChangePage}
        sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
      />
    </>
  );
}
