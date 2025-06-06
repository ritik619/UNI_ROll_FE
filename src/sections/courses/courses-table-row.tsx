import type { ICourse } from 'src/types/course';
import type { ICourseAssociation } from 'src/types/courseAssociation';

import { useState, useEffect } from 'react';
import { useBoolean, usePopover } from 'minimal-shared/hooks';
import { useTheme } from '@mui/material/styles';

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

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { UniversityQuickAddCourseAssociationForm } from '../universities/university-quick-add-course-association-form';
import { fetchAssociations } from 'src/services/associations/fetchAssociations';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = {
  row: ICourse;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onToggleStatus?: (id: string, status: 'active' | 'inactive') => void;
};

export function CoursesTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
}: Props) {
  const theme = useTheme();

  const menuActions = usePopover(); // For university row actions
  const courseMenuActions = usePopover(); // For course row actions
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();
  const quickEditAssociationForm = useBoolean();
  const collapseRow = useBoolean();
  const [university, setUniversity] = useState<ICourseAssociation[]>([]);
  const [loading, setLoading] = useState(false);

  // State to track course being deleted
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const courseDeleteDialog = useBoolean();

  const { user } = useAuthContext();

  // Fetch university when row is expanded - using mock data for now
  useEffect(() => {
    if (collapseRow.value) {
      const fetchCoursesByUniversityId = async () => {
        setLoading(true);
        try {
          const { courseAssociations: c = [] } = await fetchAssociations(
            'all',
            row.id,
            undefined,
            1,
            100,
            undefined
          );
          setUniversity(c);
        } catch (error) {
          console.error('Failed to fetch university:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCoursesByUniversityId();
    }
  }, [collapseRow.value, row.id]);

  // Function to handle course deletion
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      // Make API call to delete the course
      await authAxiosInstance.delete(`${endpoints.courses.details(courseToDelete)}`);

      // Remove the deleted course from the local state
      setUniversity((prevCourses) => prevCourses.filter((course) => course.id !== courseToDelete));

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

  const renderQuickEditForm = () => (
    <UniversityQuickAddCourseAssociationForm
      universityId={row.id}
      open={quickEditAssociationForm.value}
      onClose={quickEditAssociationForm.onFalse}
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
        {user?.role == 'admin' ? (
          <MenuItem href={editHref} component={RouterLink}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        ) : (
          <></>
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

        {user?.role == 'admin' ? (
          <MenuItem
            onClick={() => {
              confirmDialog.onTrue();
              menuActions.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        ) : (
          <></>
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
        <Button variant="contained" color="error" onClick={onDeleteRow}>
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
          </Stack>
        </Box>
      </TableCell>
      <TableCell>
        <Box component="span" sx={{ color: 'text.disabled' }}>
          {row.description
            ? row.description.length > 50
              ? `${row.description.substring(0, 50)}...`
              : row.description
            : 'No description'}
        </Box>
      </TableCell>
      <TableCell>
        {/* Duration - 17% width */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Iconify
            icon="solar:clock-circle-linear"
            width={16}
            sx={{ mr: 1, color: 'text.disabled' }}
          />
          <Typography variant="body2">
            {(() => {
              // Convert total months to years and months for display
              const totalMonths = row.durationMonths || 0;
              const years = Math.floor(totalMonths / 12);
              const months = totalMonths % 12;

              let durationText = '';

              if (years > 0) {
                durationText += `${years} ${years === 1 ? 'yr' : 'yrs'}`;
              }

              if (months > 0) {
                if (durationText) durationText += ', ';
                durationText += `${months} ${months === 1 ? 'mo' : 'mos'}`;
              }

              if (!durationText) {
                durationText = '0 months';
              }

              return durationText;
            })()}
          </Typography>
        </Box>
      </TableCell>

      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.cityName}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.countryName}</TableCell> */}

      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Link href={row.website} target="_blank" rel="noopener" sx={{ color: 'primary.main' }}>
          {row.website}
        </Link>
      </TableCell> */}

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status === 'active' && 'success') ||
            (row.status === 'inactive' && 'warning') ||
            'default'
          }
        >
          {row.status ?? 'active'}
        </Label>
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color={collapseRow.value ? 'primary' : 'default'}
            onClick={collapseRow.onToggle}
            sx={{ ...(collapseRow.value && { bgcolor: 'action.hover' }) }}
          >
            <Iconify icon="eva:arrow-ios-downward-fill" />
          </IconButton>

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
              <Typography variant="subtitle1">
                University {!loading && `(${university.length})`}
              </Typography>

              {user?.role == 'admin' ? (
                <Button
                  component={RouterLink}
                  href={`${paths.dashboard.universitiesAndCourses.addCourse}?universityId=${row.id}`}
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  sx={{ ml: 2 }}
                >
                  Add to University
                </Button>
              ) : (
                <></>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : university.length > 0 ? (
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
                      University
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
                  {university.map((course) => (
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
                      {/* universityName Name and Code - 30% width */}
                      <Box sx={{ width: '30%', pr: 2 }}>
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
                          {course.universityName}
                        </Link>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {course.courseCode}
                        </Typography>
                      </Box>
                      {/* Tuition Fee - 20% width */}
                      <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
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
                      {/* Start applicationDeadline - 20% width */}
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
                          sx={{ mr: 1 }}
                        >
                          {course.status}
                        </Label>
                        {/* Course Actions Menu */}
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
                            {user?.role == 'admin' ? (
                              <MenuItem
                                component={RouterLink}
                                href={paths.dashboard.universitiesAndCourses.editCourse(course.id)}
                                sx={{ color: 'text.primary' }}
                              >
                                <Iconify icon="solar:pen-bold" width={16} sx={{ mr: 1 }} />
                                Edit Course
                              </MenuItem>
                            ) : (
                              <></>
                            )}
                            {/* //Activate/Deactivate Option */}
                            <MenuItem
                              onClick={async () => {
                                try {
                                  const newStatus =
                                    course.status === 'active' ? 'inactive' : 'active';
                                  // await authAxiosInstance.patch(
                                  //   `${endpoints.university.status(course.id)}`,
                                  //   { status: newStatus }
                                  // );

                                  // Update the course status in the local state
                                  course.status = newStatus;

                                  // Show success message
                                  toast.success(
                                    `Course ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
                                  );

                                  // Force re-render by updating university state
                                  const updatedCourses = [...university];
                                  setUniversity(updatedCourses);

                                  // Close the menu
                                  courseMenuActions.onClose();
                                } catch (error) {
                                  console.error('Failed to update course status:', error);
                                  toast.error('Failed to update course status');
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
                              {course.status === 'active' ? 'Deactivate Course' : 'Activate Course'}
                            </MenuItem>
                            {/* Delete Option */}
                            {user?.role == 'admin' ? (
                              <MenuItem
                                onClick={() => {
                                  // Set course for deletion and show confirmation dialog
                                  setCourseToDelete(course.id);
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
                                Delete Course
                              </MenuItem>
                            ) : (
                              <></>
                            )}
                          </MenuList>
                        </CustomPopover>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  No university found for this university
                </Typography>

                {user?.role == 'admin' ? (
                  <Button
                    component={RouterLink}
                    href={`${paths.dashboard.universitiesAndCourses.addCourse}?universityId=${row.id}`}
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                  >
                    Add First Course
                  </Button>
                ) : (
                  <></>
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
      title="Delete Course"
      content="Are you sure you want to delete this course? This action cannot be undone."
      action={
        <Button variant="contained" color="error" onClick={handleDeleteCourse}>
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
      {renderMenuActions()}
      {renderConfirmDialog()}
      {renderCourseDeleteDialog()}
    </>
  );
}
