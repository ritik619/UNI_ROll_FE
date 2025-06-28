'use client';

import type { IIntake } from 'src/types/intake';
import type { TableHeadCellProps } from 'src/components/table';
import type { ICourseAssociation } from 'src/types/courseAssociation';
import type { IStudentsItem, IStudentStatus, IStudentsTableFilters } from 'src/types/students';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { usePopover, useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { MenuItem, MenuList } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchIntakes } from 'src/services/Intakes/fetchIntakes';
import { fetchStudents } from 'src/services/students/fetchStudents';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { fetchAssociations } from 'src/services/associations/fetchAssociations';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  CitySelect,
  AgentSelect,
  CourseSelect,
  IntakeSelect,
  CountrySelect,
  UniversitySelect,
} from 'src/components/select';
import {
  useTable,
  rowInPage,
  TableNoData,
  getComparator,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useAuthContext } from 'src/auth/hooks';

import { StudentsTableRow } from '../students-table-row';
import { StudentsTableFiltersResult } from '../students-table-filters-result';
import { StudentsTableToolbar } from '../students-table-toolbar';

// ----------------------------------------------------------------------
const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Enrolled', label: 'Enrolled' },
  // { value: 'Withdrawn', label: 'Withdrawn' },
  // { value: 'Deferred', label: 'Deferred' },
  // { value: 'UnEnrolled', label: 'Un-Enrolled' },
  // { value: 'Unaffiliated', label: 'Un-Affiliated' },
];

// ----------------------------------------------------------------------

export function StudentsListView() {
  const table = useTable();

  const confirmDialog = useBoolean();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<IStudentsItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [associations, setAssociations] = useState<ICourseAssociation[]>([]);
  const [intakes, setIntakes] = useState<IIntake[]>([]);
  const menuActions = usePopover();

  const { user } = useAuthContext();
  const isRefferal = user?.isReferral ? user?.isReferral : false;
  const userRole = user?.role;
  const isAdmin = userRole == 'admin';
  const isAgent = userRole == 'agent';
  const userId = user?.id;


  const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'name', label: 'Name' },
    { id: 'leadNo', label: 'Lead No', width: 120 },
    { id: 'country', label: 'Country', width: 180 },
    { id: 'phoneNumber', label: 'Phone Number' },
    ...(isRefferal
      ? [{ id: 'Notes', label: 'Notes', width: 220 },]
      : [
        { id: 'University', label: 'University', width: 220 },
        { id: 'Course', label: 'Course', width: 120 },
      ]),
    { id: 'status', label: 'Status', width: 120 },
    { id: 'payment', label: 'Payment Status', width: 200 },
    { id: '', width: 88 },
  ];

  const filters = useSetState<IStudentsTableFilters>({
    name: '',
    role: [],
    status: isRefferal ? 'All' : 'Enrolled',
    countryCode: '',
    cityId: '',
    agentId: isAgent ? userId : '',
    intakeId: '',
    universityId: '',
    courseId: '',
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'All';

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
    (id: string, newStatus: IStudentStatus) => {
      // Cast newStatus to the union if you want to be safe

      // Call async function but don't await it here (fire & forget)
      (async () => {
        try {
          await authAxiosInstance.patch(endpoints.students.status(id), {
            status: newStatus,
          });
          const updatedData = tableData.map((row) =>
            row.id === id ? { ...row, status: newStatus } : row
          );
          setTableData(updatedData);
          toast.success(`Status updated to ${newStatus}!`);
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
    (event: React.SyntheticEvent, newValue: IStudentStatus) => {
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
        table.rowsPerPage,
        currentFilters.universityId,
        currentFilters.courseId,
        currentFilters.agentId,
        currentFilters.intakeId,
        currentFilters.countryCode,
        currentFilters.cityId,
        currentFilters.name
      );
      setTableData(students);
      setTotalCount(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    currentFilters.status,
    table.page,
    table.rowsPerPage,
    currentFilters.universityId,
    currentFilters.courseId,
    currentFilters.agentId,
    currentFilters.intakeId,
    currentFilters.countryCode,
    currentFilters.cityId,
    currentFilters.name,
  ]);

  useEffect(() => {
    // table.setRowsPerPage(2);
    fetchPaginatedStudents();
  }, [fetchPaginatedStudents]);

  useEffect(() => {
    const getData = async () => {
      const { courseAssociations: c = [] } = await fetchAssociations('active');
      setAssociations(c);
      const { intakes: i } = await fetchIntakes('active');
      setIntakes(i);
    };
    getData();
  }, []);

  const handleExport = async () => {
    const { students, total } = await fetchStudents(
      currentFilters.status,
      undefined,
      undefined,
      currentFilters.universityId,
      currentFilters.courseId,
      currentFilters.agentId,
      currentFilters.intakeId,
      currentFilters.countryCode,
      currentFilters.cityId,
      currentFilters.name
    );
    const flattenObject = (obj: any, prefix = '') =>
      Object.entries(obj).reduce((acc, [k, v]) => {
        const key = prefix ? `${prefix}_${k}` : k;
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          Object.assign(acc, flattenObject(v, key));
        } else if (Array.isArray(v)) {
          acc[key] = v.join('; ');
        } else {
          acc[key] = v;
        }
        return acc;
      }, {});

    const flatData = students.map((row: any) => flattenObject(row));
    const headers = Array.from(new Set(flatData.flatMap((obj: any) => Object.keys(obj))));
    const csv = [
      headers.join(','),
      ...flatData.map((row: any) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'students.csv';
    a.click();
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        {/* <MenuItem onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:printer-minimalistic-bold" />
            Print
          </MenuItem>

          <MenuItem onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:import-bold" />
            Import
          </MenuItem> */}

        <MenuItem
          onClick={() => {
            menuActions.onClose();
            return handleExport();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const handleEnroll = async (
    studentId: string,
    data: { universityId: string; courseId: string; intakeId: string }
  ) => {
    try {
      // Find the selected university and course from associations
      const selectedUniversity = (associations as ICourseAssociation[]).find(
        (a) => a.universityId === data.universityId
      );
      const selectedCourse = (associations as ICourseAssociation[]).find(
        (a) => a.courseId === data.courseId
      );
      const selectedIntake = (intakes as IIntake[]).find((i) => i.id === data.intakeId);

      if (!selectedUniversity || !selectedCourse || !selectedIntake) {
        toast.error('Invalid selection');
        return;
      }

      // Update the student data in the table
      const updatedData = tableData.map((student) => {
        if (student.id === studentId) {
          const updatedStudent: IStudentsItem = {
            ...student,
            status: 'Enrolled',
            universityId: data.universityId,
            universityName: selectedUniversity.universityName,
            courseId: data.courseId,
            courseName: selectedCourse.courseName,
            intakeId: data.intakeId,
          };
          return updatedStudent;
        }
        return student;
      });

      // Update the table data
      setTableData(updatedData);
    } catch (error) {
      console.error('Error updating student data:', error);
      toast.error('Failed to update student data');
    }
  };

  const handleUnenroll = async (studentId: string) => {
    try {
      // Update the student data in the table
      const updatedData = tableData.map((student) => {
        if (student.id === studentId) {
          const updatedStudent: IStudentsItem = {
            ...student,
            status: 'UnEnrolled',
            universityId: undefined,
            universityName: undefined,
            courseId: undefined,
            courseName: undefined,
            intakeId: undefined,
          };
          return updatedStudent;
        }
        return student;
      });

      // Update the table data
      setTableData(updatedData);
    } catch (error) {
      console.error('Error updating student data:', error);
      toast.error('Failed to update student data');
    }
  };
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
            isAgent && (
              <Button
                component={RouterLink}
                href={paths.dashboard.students.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Student
              </Button>
            )
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <div
            style={{
              justifyContent: 'space-between',
              display: 'flex',
              marginLeft: 8,
              marginRight: 8,
            }}
          >
            <Tabs
              value={currentFilters.status}
              onChange={handleFilterStatus}
              style={{ justifyContent: 'space-between' }}
              sx={[
                (theme) => ({
                  px: 2.5,
                  boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                }),
              ]}
            >
              {STATUS_OPTIONS.map((tab) => {
                return (
                  <Tab
                    key={tab.value}
                    iconPosition="end"
                    value={tab.value}
                    label={tab.label}
                  // icon={
                  //   <Label
                  //     variant={
                  //       tab.value === 'All' || tab.value === currentFilters.status
                  //         ? 'filled'
                  //         : 'soft'
                  //     }
                  //     color={tab.value === 'Enrolled' ? 'success' : 'default'}
                  //   >
                  //     {/* {statusCount} */}
                  //   </Label>
                  // }
                  />
                );
              })}
            </Tabs>
            <IconButton onClick={menuActions.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </div>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              m: 3,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <UniversitySelect
              id="university-id"
              label="University"
              getValue="universityId"
              placeholder="Choose a University"
              onChange={(event, newValue) => {
                // Handle value change

                filters.setState({ universityId: newValue });
              }}
            />
            <CourseSelect
              id="course-id"
              label="Course"
              getValue="courseId"
              placeholder="Choose a Course"
              onChange={(event, newValue) => {
                // Handle value change

                filters.setState({ courseId: newValue });
              }}
            />
            {isAdmin && (
              <AgentSelect
                id="agent-id"
                label="Agent"
                getValue="agentId"
                placeholder="Choose a Agent"
                onChange={(event, newValue) => {
                  // Handle value change

                  filters.setState({ agentId: newValue });
                }}
              />
            )}
            <IntakeSelect
              id="intake-id"
              label="Intake"
              getValue="intakeId"
              placeholder="Choose a Intake"
              onChange={(event, newValue) => {
                // Handle value change

                filters.setState({ intakeId: newValue });
              }}
            />
            <CountrySelect
              id="country-id"
              label="Country"
              getValue="code"
              placeholder="Choose a Country"
              onChange={(event, newValue) => {
                // Handle value change

                filters.setState({ countryCode: newValue });
              }}
            />
            {filters.state.countryCode && (
              <CitySelect
                id="city-id"
                label="City"
                getValue="cityId"
                placeholder="Choose a City"
                onChange={(event, newValue) => {
                  // Handle value change

                  filters.setState({ cityId: newValue });
                }}
                countryCode={filters.state.countryCode}
              />
            )}
          </Box>
          <StudentsTableToolbar filters={filters} onResetPage={() => { }} />

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
                      {tableData.map((row) => (
                        <StudentsTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onToggleStatus={handleToggleStatus}
                          editHref={paths.dashboard.students.edit(row.id)}
                          associations={associations}
                          intakes={intakes}
                          onEnroll={handleEnroll}
                          onUnenroll={handleUnenroll}
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
            onPageChange={loading ? () => { } : table.onChangePage}
            onChangeDense={loading ? () => { } : table.onChangeDense}
            onRowsPerPageChange={loading ? () => { } : table.onChangeRowsPerPage}
            sx={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
      {renderMenuActions()}
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

  if (status !== 'All') {
    inputData = inputData.filter((students) => students.status === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((students) => role.includes(students.role));
  // }

  return inputData;
}
