'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IUniversity, IUniversityTableFilters } from 'src/types/university';

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
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { fetchUniversities } from 'src/services/universities/fetchUniversities';

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

import { UniversityTableRow } from '../university-table-row';
import { UniversityTableFiltersResult } from '../university-table-filters-result';
import { UniversityTableToolbar } from '../university-table-toolbar';
import { Field } from 'src/components/hook-form';
import { CitySelect, CountrySelect } from 'src/components/select';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'University Name' },
  { id: 'cityName', label: 'City', width: 180 },
  { id: 'countryName', label: 'Country', width: 180 },
  { id: 'website', label: 'Website', width: 220 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function UniversityListView() {
  const table = useTable();

  const confirmDialog = useBoolean();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<IUniversity[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const { user } = useAuthContext();
  const userRole = user?.role;
  const userId = user?.id;
  console.log('user', user, 'userRole', userRole, 'userId', userId);

  const filters = useSetState<IUniversityTableFilters>({
    name: '',
    role: [],
    status: 'all',
    countryCode: '',
    cityId: '',
  });
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
    async (id: string, newStatus: 'active' | 'inactive') => {
      try {
        // Call API to update the university status
        await authAxiosInstance.patch(endpoints.universities.status(id), {
          status: newStatus,
        });

        // Update the data locally
        const updatedData = tableData.map((row) =>
          row.id === id ? { ...row, status: newStatus } : row
        );

        setTableData(updatedData);
        toast.success(`University status updated to ${newStatus}!`);
      } catch (error) {
        console.error(error);
        toast.error('Failed to update university status');
      }
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
    (event: React.SyntheticEvent, newValue: 'all' | 'active' | 'inactive' | undefined) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );
  console.log(filters);
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
  const fetchPaginatedUniversities = useCallback(async () => {
    try {
      setLoading(true);
      const { universities, total } = await fetchUniversities(
        filters.state.status,
        table.page,
        table.rowsPerPage,
        filters.state.cityId,
        filters.state.countryCode
      );
      console.log(universities);
      setTableData(universities);
      setTotalCount(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filters.state]);

  useEffect(() => {
    fetchPaginatedUniversities();
  }, [fetchPaginatedUniversities, filters.state.status, filters.state.cityId, filters.state.countryCode]);

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Universities List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Universities', href: paths.dashboard.universitiesAndCourses.list },
            { name: 'List' },
          ]}
          action={
            userRole == 'admin' ? (
              <Button
                component={RouterLink}
                href={paths.dashboard.universitiesAndCourses.addUniversity}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New University
              </Button>
            ) : (
              <></>
            )
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
          {/* <UniversityTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ roles:  }}
          /> */}
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              m: 3,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <CountrySelect
              id="country-id"
              label="Country"
              getValue="code"
              placeholder="Choose a country"
              onChange={(event, newValue) => {
                // Handle value change
                console.log(newValue);
                filters.setState({ countryCode: newValue });
              }}
            />
            {filters.state.countryCode && (
              <CitySelect
                id="city-id"
                label="City"
                getValue="cityId"
                onChange={(event, newValue) => {
                  // Handle value change
                  console.log(newValue);
                  filters.setState({ cityId: newValue });
                }}
                countryCode={filters.state.countryCode}
              />
            )}
          </Box>
          {canReset && (
            <UniversityTableFiltersResult
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
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     dataFiltered.map((row) => row.id)
                  //   )
                  // }
                />

                <TableBody>
                  {loading ? (
                    <TableSkeleton rowCount={table.rowsPerPage} cellCount={TABLE_HEAD.length} />
                  ) : (
                    <>
                        {tableData.length > 0 ? (
                          tableData.map((row) => (
                          <UniversityTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onToggleStatus={handleToggleStatus as any}
                            editHref={paths.dashboard.universitiesAndCourses.list}
                          />
                          ))
                        ) : (
                          <TableNoData notFound={notFound} />
                        )}

                        {tableData.length > 0 && tableData.length < table.rowsPerPage && (
                          <TableEmptyRows
                            height={table.dense ? 56 : 56 + 20}
                            emptyRows={table.rowsPerPage - tableData.length}
                          />
                        )}
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
  inputData: IUniversity[];
  filters: IUniversityTableFilters;
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
    inputData = inputData.filter((university) =>
      university.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((university) => university.status === status);
  }

  if (role.length) {
    // Universities don't have roles, but keeping this for compatibility with the filter interface
    // This can be updated later when the filter interface is properly adjusted for universities
    inputData = inputData;
  }

  return inputData;
}
