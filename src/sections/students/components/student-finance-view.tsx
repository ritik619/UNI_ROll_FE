import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { IStudentsItem } from 'src/types/students';

// ----------------------------------------------------------------------

type Props = {
  student: IStudentsItem;
  onRefresh: () => void;
};

export function StudentFinanceView({ student, onRefresh }: Props) {
  // Mock data - replace with actual data from API
  const transactions = [
    {
      id: 1,
      date: '2024-03-15',
      description: 'Course Payment',
      amount: 5000,
      status: 'paid',
    },
    {
      id: 2,
      date: '2024-03-10',
      description: 'Application Fee',
      amount: 200,
      status: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Card sx={{ p: 3, flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Total Paid
            </Typography>
            <Typography variant="h4">£5,000</Typography>
          </Stack>
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Pending Payments
            </Typography>
            <Typography variant="h4">£200</Typography>
          </Stack>
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Next Payment Due
            </Typography>
            <Typography variant="h4">£1,000</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Due on 15th April 2024
            </Typography>
          </Stack>
        </Card>
      </Stack>

      {/* Transactions Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">£{transaction.amount}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="eva:eye-fill" />}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
} 