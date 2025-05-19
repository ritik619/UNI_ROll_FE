'use client';

import type { ICourse } from 'src/types/intake';
import type { IUniversity } from 'src/types/university';

import { useState } from 'react';
import { usePopover , useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import { MenuList } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
// import { SearchInput } from 'src/components/search-input';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  courses: ICourse[];
  university: IUniversity;
  onCoursesChange: () => void;
};

export function UniversityCoursesView({ courses: initialCourses, university, onCoursesChange }: Props) {
  const theme = useTheme();
  const router = useRouter();
  
  const [courses, setCourses] = useState<ICourse[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const courseDeleteDialog = useBoolean();
  const courseActionMenu = usePopover();
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleFilterChange = (event: React.SyntheticEvent, newValue: string) => {
    setFilter(newValue);
  };
  
  const filteredCourses = courses.filter((course) => {
    // Filter by active/inactive status
    if (filter === 'active' && course.status !== 'active') return false;
    if (filter === 'inactive' && course.status !== 'inactive') return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    try {
      await authAxiosInstance.delete(`${endpoints.courses.details(courseToDelete)}`);
      
      // Remove the deleted course from the local state
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseToDelete));
      
      toast.success('Course deleted successfully');
      
      // Call the callback to refresh courses if needed
      onCoursesChange();
      
      // Reset state
      setCourseToDelete(null);
      courseDeleteDialog.onFalse();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    }
  };
  
  const handleToggleCourseStatus = async (courseId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await authAxiosInstance.patch(
        `${endpoints.courses.status(courseId)}`,
        { status: newStatus }
      );
      
      // Update the course status in the local state
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId ? { ...course, status: newStatus } : course
        )
      );
      
      toast.success(`Course ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      
      // Call the callback to refresh courses if needed
      onCoursesChange();
    } catch (error) {
      console.error('Failed to update course status:', error);
      toast.error('Failed to update course status');
    }
  };
  
  // Function to convert total months to years and months for display
  const formatDuration = (totalMonths: number | undefined) => {
    if (!totalMonths) return 'N/A';
    
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    let durationText = '';
    
    if (years > 0) {
      durationText += `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    if (months > 0) {
      if (durationText) durationText += ' ';
      durationText += `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    
    return durationText || 'N/A';
  };
  
  const renderCourseCard = (course: ICourse) => (
    <Grid item xs={12} sm={6} md={4} key={course.id}>
      <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Label
              variant="soft"
              color={
                (course.status === 'active' && 'success') ||
                (course.status === 'inactive' && 'warning') ||
                'default'
              }
            >
              {course.status}
            </Label>
            
            <IconButton
              size="small"
              onClick={(event) => {
                setCourseToDelete(course.id);
                courseActionMenu.onOpen(event, course.id);
              }}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
          
          <Stack spacing={1}>
            <Typography 
              variant="subtitle1" 
              component={RouterLink}
              href={paths.dashboard.universitiesAndCourses.editCourse(course.id)}
              sx={{ 
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {course.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {course.code}
            </Typography>
          </Stack>
          
          <Divider sx={{ borderStyle: 'dashed' }} />
          
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <Iconify 
                icon="solar:clock-circle-linear" 
                width={16} 
                sx={{ mr: 1, color: 'text.disabled' }}
              />
              <Typography variant="body2">{formatDuration(course.durationMonths)}</Typography>
            </Stack>
            
            {course.tuitionFee && (
              <Stack direction="row" alignItems="center">
                <Iconify 
                  icon="solar:tag-price-linear" 
                  width={16} 
                  sx={{ mr: 1, color: 'text.disabled' }}
                />
                <Typography variant="body2">{fCurrency(course.tuitionFee)}</Typography>
              </Stack>
            )}
            
            {course.startDates && course.startDates.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Start Dates
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {course.startDates.slice(0, 3).map((date) => (
                    <Typography 
                      key={date} 
                      variant="caption" 
                      sx={{ 
                        color: 'text.primary',
                        bgcolor: 'action.selected',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 500
                      }}
                    >
                      {new Date(date).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  ))}
                  {course.startDates.length > 3 && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.primary',
                        bgcolor: 'action.selected',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      +{course.startDates.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              component={RouterLink}
              href={paths.dashboard.universitiesAndCourses.editCourse(course.id)}
              variant="outlined"
              size="small"
            >
              Edit
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color={course.status === 'active' ? 'warning' : 'success'}
              size="small"
              onClick={() => handleToggleCourseStatus(course.id, course.status)}
            >
              {course.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );
  
  const renderCards = () => (
    <Grid container spacing={3}>
      {filteredCourses.map((course) => renderCourseCard(course))}
    </Grid>
  );
  
  const renderTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Course</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Tuition Fee</TableCell>
            <TableCell>Start Dates</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {filteredCourses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography 
                    variant="body2"
                    component={RouterLink}
                    href={paths.dashboard.universitiesAndCourses.editCourse(course.id)}
                    sx={{ 
                      color: 'text.primary',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {course.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {course.code}
                  </Typography>
                </Stack>
              </TableCell>
              
              <TableCell>{formatDuration(course.durationMonths)}</TableCell>
              
              <TableCell>
                {course.tuitionFee ? fCurrency(course.tuitionFee) : '—'}
              </TableCell>
              
              <TableCell>
                {course.startDates && course.startDates.length > 0 ? (
                  <Stack spacing={0.5}>
                    {course.startDates.slice(0, 2).map((date) => (
                      <Typography key={date} variant="caption">
                        {new Date(date).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    ))}
                    {course.startDates.length > 2 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        +{course.startDates.length - 2} more
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  '—'
                )}
              </TableCell>
              
              <TableCell>
                <Label
                  variant="soft"
                  color={
                    (course.status === 'active' && 'success') ||
                    (course.status === 'inactive' && 'warning') ||
                    'default'
                  }
                >
                  {course.status}
                </Label>
              </TableCell>
              
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    setCourseToDelete(course.id);
                    courseActionMenu.onOpen(event, course.id);
                  }}
                >
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  const renderCourseActionMenu = () => (
    <CustomPopover
      open={courseActionMenu.open}
      anchorEl={courseActionMenu.anchorEl}
      onClose={courseActionMenu.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem 
          component={RouterLink}
          href={courseToDelete ? paths.dashboard.universitiesAndCourses.editCourse(courseToDelete) : '#'}
          sx={{ color: 'text.primary' }}
        >
          <Iconify icon="solar:pen-bold" width={16} sx={{ mr: 1 }} />
          Edit Course
        </MenuItem>
        
        {courseToDelete && (
          <MenuItem
            onClick={() => {
              const course = courses.find((c) => c.id === courseToDelete);
              if (course) {
                handleToggleCourseStatus(course.id, course.status);
              }
              courseActionMenu.onClose();
            }}
            sx={{ 
              color: courseToDelete && 
                courses.find((c) => c.id === courseToDelete)?.status === 'active' 
                ? 'warning.main' 
                : 'success.main' 
            }}
          >
            <Iconify 
              icon={
                courseToDelete && 
                courses.find((c) => c.id === courseToDelete)?.status === 'active'
                  ? 'material-symbols:toggle-off' 
                  : 'material-symbols:toggle-on'
              } 
              width={16} 
              sx={{ mr: 1 }} 
            />
            {courseToDelete && 
             courses.find((c) => c.id === courseToDelete)?.status === 'active' 
              ? 'Deactivate Course' 
              : 'Activate Course'}
          </MenuItem>
        )}
        
        <MenuItem
          onClick={() => {
            courseDeleteDialog.onTrue();
            courseActionMenu.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={16} sx={{ mr: 1 }} />
          Delete Course
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );
  
  const viewOptions = [
    { value: 'cards', label: 'Cards', icon: 'solar:gallery-wide-bold' },
    { value: 'list', label: 'List', icon: 'solar:list-bold' },
  ];
  
  const [viewMode, setViewMode] = useState('cards');
  
  return (
    <>
      <Card>
        <Box sx={{ p: 3 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            alignItems={{ sm: 'center' }} 
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            {/* <SearchInput
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearch}
              sx={{ maxWidth: 500 }}
            /> */}
            
            <Stack direction="row" spacing={1}>
              {viewOptions.map((option) => (
                <Button
                  key={option.value}
                  size="small"
                  color={viewMode === option.value ? 'primary' : 'inherit'}
                  variant={viewMode === option.value ? 'contained' : 'text'}
                  startIcon={<Iconify icon={option.icon} />}
                  onClick={() => setViewMode(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </Stack>
          </Stack>
          
          <Tabs
            value={filter}
            onChange={handleFilterChange}
            sx={{
              mb: 3,
              '& .MuiTabs-flexContainer': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Tab value="all" label="All Courses" />
            <Tab value="active" label="Active" />
            <Tab value="inactive" label="Inactive" />
          </Tabs>
          
          {filteredCourses.length > 0 ? (
            viewMode === 'cards' ? renderCards() : renderTable()
          ) : (
            <EmptyContent
              title="No Courses Found"
              description={searchQuery ? "Try different search terms" : "This university has no courses yet"}
              sx={{ py: 5 }}
              action={
                <Button
                  component={RouterLink}
                  href={`${paths.dashboard.universitiesAndCourses.addCourse}?universityId=${university.id}`}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  sx={{ mt: 3 }}
                >
                  Add Course
                </Button>
              }
            />
          )}
        </Box>
      </Card>
      
      {/* Course Delete Confirmation */}
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
      
      {/* Course Action Menu */}
      {renderCourseActionMenu()}
    </>
  );
}