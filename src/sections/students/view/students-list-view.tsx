'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IStudentsItem, IStudentsTableFilters } from 'src/types/students';

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

import { STUDENTS_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchStudents } from 'src/services/students/fetchStudents';
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

import { StudentsTableRow } from '../students-table-row';
import { StudentsTableFiltersResult } from '../students-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...STUDENTS_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name' },
  { id: 'id', label: 'ID' },
  { id: 'University', label: 'University', width: 220 },
  { id: 'status', label: 'Status', width: 100 },
  // { id: 'role', label: 'Role', width: 180 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function StudentsListView() {
  const table = useTable();

  const confirmDialog = useBoolean();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<IStudentsItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const filters = useSetState<IStudentsTableFilters>({ name: '', role: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleToggleStatus = useCallback(
    (id: string, newStatus: string) => {
      // Cast newStatus to the union if you want to be safe
      const typedStatus = newStatus as 'free' | 'interested' | 'enrolled' | 'unenrolled';

      // Call async function but don't await it here (fire & forget)
      (async () => {
        try {
          await authAxiosInstance.patch(endpoints.students.status(id), {
            status: typedStatus,
          });
          const updatedData = tableData.map((row) =>
            row.id === id ? { ...row, status: typedStatus } : row
          );
          setTableData(updatedData);
          toast.success(`Status updated to ${typedStatus}!`);
        } catch (error) {
          toast.error('Failed to update status');
        }
      })();
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleFilterStatus = useCallback(
    (
      event: React.SyntheticEvent,
      newValue: 'all' | 'free' | 'interested' | 'enrolled' | 'unenrolled'
    ) => {
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
  const fetchPaginatedStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { students, total } = await fetchStudents(
        currentFilters.status,
        table.page,
        table.rowsPerPage
      );
      setTableData(students);
      setTotalCount(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters.status, table.page, table.rowsPerPage]);

  useEffect(() => {
    // table.setRowsPerPage(2);
    fetchPaginatedStudents();
  }, [fetchPaginatedStudents]);

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Students', href: paths.dashboard.students.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.students.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Student
            </Button>
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
                    color={(tab.value === 'enrolled' && 'success') || 'default'}
                  >
                    {['enrolled', 'unenrolled'].includes(tab.value)
                      ? tableData.filter((students) => students.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          {/* <StudentsTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ roles: _roles }}
          /> */}

          {canReset && (
            <StudentsTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
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
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {loading ? (
                    <TableSkeleton rowCount={table.rowsPerPage} cellCount={TABLE_HEAD.length} />
                  ) : (
                    <>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <StudentsTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onToggleStatus={handleToggleStatus}
                            editHref={paths.dashboard.students.edit(row.id)}
                          />
                        ))}

                      <TableEmptyRows
                        height={table.dense ? 56 : 56 + 20}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                      />

                      <TableNoData notFound={notFound && !loading} />
                    </>
                  )}
                </TableBody>
                {/* <TableFooter style={{backgroundColor:'yellow',flex:1,}}>
                  <TableRow >
                    <TablePagination
                      rowsPerPageOptions={[1, 5, 10, 25, { label: 'All', value: -1 }]}
                      colSpan={6}
                      count={tableData.length}
                      rowsPerPage={table.rowsPerPage}
                      page={table.page}
                      slotProps={{
                        select: {
                          inputProps: {
                            'aria-label': 'Rows per page',
                          },
                          native: true,
                        },
                      }}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter> */}
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={totalCount}
            rowsPerPage={table.rowsPerPage}
            onPageChange={loading ? () => {} : table.onChangePage}
            onChangeDense={loading ? () => {} : table.onChangeDense}
            onRowsPerPageChange={loading ? () => {} : table.onChangeRowsPerPage}
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
  inputData: IStudentsItem[];
  filters: IStudentsTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((students) =>
      students.firstName.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((students) => students.status === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((students) => role.includes(students.role));
  // }

  return inputData;
}
