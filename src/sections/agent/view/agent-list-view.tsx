'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IAgentItem, IAgentTableFilters } from 'src/types/agent';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { USER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchAgents } from 'src/services/agents/fetchAgents';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { AgentTableRow } from '../agent-table-row';
import { AgentTableFiltersResult } from '../agent-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name', width: 150 },
  { id: 'utrNumber', label: 'UTR Number', width: 150 },
  { id: 'bankDetails', label: 'Bank Details', width: 220 },
  { id: 'postCode', label: 'Post Code', width: 120 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'payments', label: 'Payment Details', width: 200 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function AgentListView({earning}:{earning?:boolean}) {
  const table = useTable();

  const confirmDialog = useBoolean();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<IAgentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const filters = useSetState<IAgentTableFilters>({ name: '', role: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const fetchPaginatedAgents = useCallback(async () => {
    try {
      setLoading(true);
      const { agents, total } = await fetchAgents(
        filters.state.status,
        table.page,
        table.rowsPerPage
      );
      setTableData(agents);
      setTotalCount(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filters.state.status]);

  useEffect(() => {
    fetchPaginatedAgents();
  }, [fetchPaginatedAgents]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    table.setPage(newPage);
  }, [table]);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    table.setRowsPerPage(newRowsPerPage);
    table.setPage(0);
  }, [table]);

  const canReset = !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';
  const notFound = !tableData.length;

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(tableData.length);
    },
    [tableData, table]
  );

  const handleToggleStatus = useCallback(
    async (id: string, newStatus: 'active' | 'inactive') => {
      await authAxiosInstance.patch(endpoints.agents.status(id), {
        status: newStatus,
      });
      const updatedData = tableData.map((row) =>
        row.id === id ? { ...row, status: newStatus } : row
      );

      setTableData(updatedData);
      toast.success(`Status updated to ${newStatus}!`);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows(tableData.length, tableData.length);
  }, [tableData, table]);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: 'all' | 'active' | 'inactive') => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  useEffect(()=>{
    if(earning){
      table.setDense(true);
    }
  },[earning])

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Agents"
          links={earning?[]:[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Agent', href: paths.dashboard.agent.root },
            { name: 'List' },
          ]}
          action={
            !earning && (
            <Button
              component={RouterLink}
              href={paths.dashboard.agent.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Agent
            </Button>)
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: 2.5,
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === currentFilters.status) && 'filled') ||
                      'soft'
                    }
                    color={(tab.value === 'Active' && 'success') || 'default'}
                  >
                    {['active', 'inactive'].includes(tab.value)
                      ? tableData.filter((agent) => agent.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          {/* <AgentTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ roles: _roles }}
          /> */}

          {canReset && (
            <AgentTableFiltersResult
              filters={filters}
              totalResults={tableData.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {loading ? (
                    <TableSkeleton rowCount={table.rowsPerPage} cellCount={TABLE_HEAD.length} />
                  ) : (
                    <>
                        {tableData.map((row) => (
                          <AgentTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onToggleStatus={handleToggleStatus}
                            editHref={paths.dashboard.agent.edit(row.id)}
                          />
                        ))}

                        {!loading && tableData.length === 0 && <TableNoData notFound={notFound} />}

                        {!loading && tableData.length > 0 && tableData.length < table.rowsPerPage && (
                          <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={table.rowsPerPage - tableData.length}
                          />
                        )}
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={totalCount}
            rowsPerPage={table.rowsPerPage}
            onPageChange={loading ? () => { } : handleChangePage}
            onChangeDense={loading ? () => {} : table.onChangeDense}
            onRowsPerPageChange={loading ? () => { } : handleChangeRowsPerPage}
            sx={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IAgentItem[];
  filters: IAgentTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((agent) =>
      agent.name?.toLowerCase().includes(name.toLowerCase()) ||
      `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((agent) => agent.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((agent) => role.includes(agent.role));
  }

  return inputData;
}
