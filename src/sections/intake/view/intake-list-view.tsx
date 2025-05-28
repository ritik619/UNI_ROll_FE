'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IIntake, IIntakeTableFilters } from 'src/types/intake';

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
import { fetchIntakes } from 'src/services/Intakes/fetchIntakes';
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

import { IntakeTableRow } from '../intake-table-row';
import { IntakesTableFiltersResult } from '../intake-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Intake Name' },
  { id: 'startDate', label: 'Start Date', width: 180 },
  { id: 'endDate', label: 'End Date', width: 180 },
  // { id: 'description', label: 'Website', width: 220 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function IntakeListView() {
  const table = useTable();

  const confirmDialog = useBoolean();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<IIntake[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const filters = useSetState<IIntakeTableFilters>({
    name: '',
    role: [],
    status: 'all',
    // countryCode: '',
    // cityId: '',
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
        await authAxiosInstance.patch(endpoints.intakes.status(id), {
          status: newStatus,
        });

        // Update the data locally
        const updatedData = tableData.map((row) =>
          row.id === id ? { ...row, status: newStatus } : row
        );

        setTableData(updatedData);
        toast.success(`Intake status updated to ${newStatus}!`);
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
    (event: React.SyntheticEvent, newValue: string) => {
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
  const fetchPaginatedIntakes = useCallback(async () => {
    try {
      setLoading(true);
      const { intakes, total } = await fetchIntakes(
        filters.state.status,
        table.page,
        table.rowsPerPage
      );
      console.log(intakes);
      setTableData(intakes);
      setTotalCount(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filters.state]);

  useEffect(() => {
    // table.setRowsPerPage(2);
    fetchPaginatedIntakes();
  }, [fetchPaginatedIntakes]);

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Intakes List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Intakes', href: paths.dashboard.intakes.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.intakes.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Intake
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
          {/* <IntakeTableToolbar
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
            {/* <CountrySelect
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
            )} */}
          </Box>
          {canReset && (
            <IntakesTableFiltersResult
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
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <IntakeTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onToggleStatus={handleToggleStatus as any}
                            editHref={paths.dashboard.intakes.new}
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
  inputData: IIntake[];
  filters: IIntakeTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const {
    name,
    status,
    //  role
  } = filters;

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

  // if (role.length) {
  //   // Intakes don't have roles, but keeping this for compatibility with the filter interface
  //   // This can be updated later when the filter interface is properly adjusted for Intakes
  //   inputData = inputData;
  // }

  return inputData;
}
