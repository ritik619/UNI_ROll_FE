import type { IUniversity } from 'src/types/university';
import type { ICourseAssociation } from 'src/types/courseAssociation';

import { useState, useEffect } from 'react';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { fetchAssociations } from 'src/services/associations/fetchAssociations';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { UniversityQuickEditForm } from './university-quick-edit-form';
import { UniversityQuickAddCourseAssociationForm } from './university-quick-add-course-association-form';
import { useAuthContext } from 'src/auth/hooks';

import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type Props = {
  row: IUniversity;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onToggleStatus?: (id: string, status: string) => void;
  earning?: boolean;
};

export function UniversityTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
  earning,
}: Props) {
  const theme = useTheme();
  const menuActions = usePopover(); // For university row actions
  const courseMenuActions = usePopover(); // For course row actions
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();
  const quickAddCourse = useBoolean();

  const collapseRow = useBoolean();
  const [courses, setCourses] = useState<ICourseAssociation[]>([]);
  const [loading, setLoading] = useState(false);

  // State to track course being deleted
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [associationToDelete, setAssociationToDelete] = useState<string | null>(null);
  const courseDeleteDialog = useBoolean();

  const { user } = useAuthContext();
  const userRole = user?.role;
  const isAdmin = userRole == 'admin';
  const isAgent = userRole == 'agent';

  // Fetch courses when row is expanded - using mock data for now
  useEffect(() => {
    if (collapseRow.value && !earning) {
      const fetchCoursesById = async () => {
        setLoading(true);
        try {
          const { courseAssociations: c = [] } = await fetchAssociations(
            'all',
            undefined,
            row.id,
            1,
            100,
            undefined
          );
          setCourses(c);
        } catch (error) {
          console.error('Failed to fetch courses:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCoursesById();
    }
  }, [collapseRow.value, row.id, earning]);

  // Function to handle course deletion
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      // Make API call to delete the course
      await authAxiosInstance.delete(`${endpoints.courses.details(courseToDelete)}`);

      // Remove the deleted course from the local state
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseToDelete));

      // Show success message
      toast.success('Course deleted successfully');

      // Reset the course to delete
      setCourseToDelete(null);
      courseDeleteDialog.onFalse();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    }
  };
  const handleDeleteAssociation = async () => {
    console.log('handleDeleteAssociation');
    if (!associationToDelete) return;

    try {
      // Make API call to delete the association
      await authAxiosInstance.delete(
        `${endpoints.associations.byAssociation(associationToDelete)}`
      );

      // Remove the deleted association from local state
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== associationToDelete)
      );

      // Show success message
      toast.success('Association deleted successfully');

      // Reset selected ID and close dialog
      setAssociationToDelete(null);
      courseDeleteDialog.onFalse();
    } catch (error) {
      console.error('Failed to delete association:', error);
      toast.error('Failed to delete association');
    }
  };

  const renderQuickEditForm = () => (
    <UniversityQuickEditForm
      currentUniversity={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
    />
  );

  const renderQuickAddCourseForm = () => (
    <UniversityQuickAddCourseAssociationForm
      universityId={row.id}
      open={quickAddCourse.value}
      onClose={quickAddCourse.onFalse}
    />
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        {isAdmin && (
          <>
            <MenuItem href={editHref} onClick={quickEditForm.onTrue}>
              <Iconify icon="solar:pen-bold" />
              Edit
            </MenuItem>

            <MenuItem href={editHref} onClick={quickAddCourse.onTrue}>
              <Iconify icon="tabler:school" />
              Add Course
            </MenuItem>
          </>
        )}

        <MenuItem
          onClick={() => {
            if (onToggleStatus) {
              const newStatus = row.status === 'active' ? 'inactive' : 'active';
              onToggleStatus(row.id, newStatus);
            }
            menuActions.onClose();
          }}
          sx={{ color: row.status === 'active' ? 'warning.main' : 'success.main' }}
        >
          <Iconify
            icon={
              row.status === 'active' ? 'material-symbols:toggle-off' : 'material-symbols:toggle-on'
            }
          />
          {row.status === 'active' ? 'Deactivate' : 'Activate'}
        </MenuItem>

        {isAdmin && (
          <MenuItem
            onClick={() => {
              setCourseToDelete(course.id);
              confirmDialog.onTrue();
              menuActions.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        )}
      </MenuList>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={handleDeleteCourse}>
          Delete
        </Button>
      }
    />
  );

  const renderPrimaryRow = () => (
    <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
      {/* <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{
            id: `${row.id}-checkbox`,
            'aria-label': `${row.id} checkbox`,
          }}
        />
      </TableCell> */}

      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          {/* <Avatar alt={row.name} src={row?.logoUrl} /> */}

          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Link
              component={RouterLink}
              href={paths.dashboard.universitiesAndCourses.universityCourses(row.id)}
              color="inherit"
              sx={{ cursor: 'pointer' }}
            >
              {row.name}
            </Link>
            <Box component="span" sx={{ color: 'text.disabled' }}>
              {row.description
                ? row.description.length > 50
                  ? `${row.description.substring(0, 50)}...`
                  : row.description
                : 'No description'}
            </Box>
          </Stack>
        </Box>
      </TableCell>

      <TableCell>{row.cityName}</TableCell>
      <TableCell>{row.countryName}</TableCell>
      <TableCell>
        <Link href={row.website} target="_blank" rel="noopener" sx={{ color: 'primary.main' }}>
          {row.website}
        </Link>
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status === 'active' && 'success') ||
            (row.status === 'inactive' && 'warning') ||
            'default'
          }
        >
          {row.status}
        </Label>
      </TableCell>
      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Total: {row.totalAmount ? fCurrency(row.totalAmount) : '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'success.main' }}>
            Paid: {row.paidAmount ? fCurrency(row.paidAmount) : '—'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            Pending: {row.pendingAmount ? fCurrency(row.pendingAmount) : '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!earning && (
            <IconButton
              color={collapseRow.value ? 'primary' : 'default'}
              onClick={collapseRow.onToggle}
              sx={{ ...(collapseRow.value && { bgcolor: 'action.hover' }) }}
            >
              <Iconify icon="eva:arrow-ios-downward-fill" />
            </IconButton>
          )}

          <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderAssociationRow = () => (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5, p: 2 }}>
            <Box
              sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="subtitle1" aria-description="description">
                Course {!loading && `(${courses.length})`}
              </Typography>

              {isAdmin && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={quickAddCourse.onTrue}
                  startIcon={<Iconify icon="mingcute:add-line" sx={{ ml: 2 }} />}
                >
                  Add Course to University
                </Button>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : courses.length > 0 ? (
              <>
                {/* Table Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: theme.spacing(1.5, 2.5),
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Box sx={{ width: '30%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Course
                    </Typography>
                  </Box>

                  <Box sx={{ width: '20%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Tuition Fee
                    </Typography>
                  </Box>
                  <Box sx={{ width: '20%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Start Date
                    </Typography>
                  </Box>
                  <Box sx={{ width: '20%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Deadline Date
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Status
                    </Typography>
                  </Box>
                </Box>
                <Stack spacing={2}>
                  {courses.map((course) => (
                    <Box
                      key={course.id}
                      sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        p: theme.spacing(2, 2.5),
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        boxShadow: theme.shadows[1],
                      })}
                    >
                      {/* Course Name and Code - 30% width */}
                      <Box sx={{ width: '30%' }}>
                        <Link
                          component={RouterLink}
                          href={paths.dashboard.universitiesAndCourses.editCourse(course.id)}
                          color="inherit"
                          sx={{
                            typography: 'subtitle2',
                            display: 'block',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {course.courseName}
                        </Link>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {course.courseCode}
                        </Typography>
                      </Box>

                      {/* Tuition Fee - 20% width */}
                      <Box sx={{ width: '20%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {course.price ? fCurrency(course.price) : '—'}
                        </Typography>
                      </Box>

                      {/* Start Date - 20% width */}
                      <Box sx={{ width: '20%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.75,
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.primary',
                              bgcolor: 'action.selected',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 500,
                            }}
                          >
                            {new Date(course.startDate).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Deadline Date - 20% width */}
                      <Box sx={{ width: '20%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.75,
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.primary',
                              bgcolor: 'action.selected',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 500,
                            }}
                          >
                            {new Date(course.applicationDeadline).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Status and Actions - remainder width */}
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Label
                          variant="soft"
                          color={
                            (course.status === 'active' && 'success') ||
                            (course.status === 'inactive' && 'warning') ||
                            'default'
                          }
                          sx={{ p: 2, mr: 2 }}
                        >
                          {course.status}
                        </Label>
                        <IconButton
                          size="small"
                          color="default"
                          onClick={(event) => {
                            event.stopPropagation();
                            // Create a unique popover ID for each course
                            const courseMenuId = `course-menu-${course.id}`;
                            courseMenuActions.onOpen(event, courseMenuId);
                          }}
                        >
                          <Iconify icon="eva:more-vertical-fill" width={18} />
                        </IconButton>
                        {/* Course Actions Popover */}
                        <CustomPopover
                          open={courseMenuActions.open}
                          anchorEl={courseMenuActions.anchorEl}
                          onClose={() => courseMenuActions.onClose()}
                          slotProps={{ arrow: { placement: 'right-top' } }}
                          id={courseMenuActions.id}
                        >
                          <MenuList>
                            {/* {isAdmin && (
                              <MenuItem
                                component={RouterLink}
                                href={paths.dashboard.universitiesAndCourses.editCourse(course.id)}
                                sx={{ color: 'text.primary' }}
                              >
                                <Iconify icon="solar:pen-bold" width={16} sx={{ mr: 1 }} />
                                Edit Course
                              </MenuItem>
                            )} */}
                            <MenuItem
                              onClick={async () => {
                                try {
                                  const newStatus =
                                    course.status === 'active' ? 'inactive' : 'active';
                                  course.status = newStatus;

                                  // Sho  w success message
                                  toast.success(
                                    `Course ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
                                  );

                                  // Force re-render by updating courses state
                                  const updatedCourses = [...courses];
                                  setCourses(updatedCourses);

                                  // Close the menu
                                  courseMenuActions.onClose();
                                } catch (error) {
                                  console.error('Failed to update association status:', error);
                                  toast.error('Failed to update association status');
                                }
                              }}
                              sx={{
                                color: course.status === 'active' ? 'warning.main' : 'success.main',
                              }}
                            >
                              <Iconify
                                icon={
                                  course.status === 'active'
                                    ? 'material-symbols:toggle-off'
                                    : 'material-symbols:toggle-on'
                                }
                                width={16}
                                sx={{ mr: 1 }}
                              />
                              {course.status === 'active'
                                ? 'Deactivate Association'
                                : 'Activate Association'}
                            </MenuItem>
                            {/* Delete Option */}
                            {isAdmin && (
                              <MenuItem
                                onClick={() => {
                                  // Set course for deletion and show confirmation dialog
                                  setAssociationToDelete(course.id);
                                  courseDeleteDialog.onTrue();
                                  // Close the menu
                                  courseMenuActions.onClose();
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <Iconify
                                  icon="solar:trash-bin-trash-bold"
                                  width={16}
                                  sx={{ mr: 1 }}
                                />
                                Delete Association
                              </MenuItem>
                            )}
                          </MenuList>
                        </CustomPopover>
                      </Box>
                    </Box>
                  ))}
                </Stack>{' '}
              </>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  No courses found for this university
                </Typography>

                {isAdmin && (
                  <Button
                    component={RouterLink}
                    href={`${paths.dashboard.universitiesAndCourses.addCourse}?universityId=${row.id}`}
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                  >
                    Add First Course
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  const renderCourseDeleteDialog = () => (
    <ConfirmDialog
      open={courseDeleteDialog.value}
      onClose={() => {
        courseDeleteDialog.onFalse();
        setCourseToDelete(null);
      }}
      title="Delete Association"
      content={
        <>
          Are you sure you want to remove this Association?
          <br />
          This action cannot be undone.
        </>
      }
      action={
        <Button variant="contained" color="error" onClick={handleDeleteAssociation}>
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      {renderPrimaryRow()}
      {renderAssociationRow()}
      {renderQuickEditForm()}
      {renderQuickAddCourseForm()}
      {renderMenuActions()}
      {renderConfirmDialog()}
      {renderCourseDeleteDialog()}
    </>
  );
}
