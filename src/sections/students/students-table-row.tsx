import type { IIntake } from 'src/types/intake';
import type { IStudentsItem } from 'src/types/students';
import type { ICourseAssociation } from 'src/types/courseAssociation';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { StudentsQuickEditForm } from './students-quick-edit-form';
import { StudentQuickEnrollForm } from './students-quick-enroll-form';

// ----------------------------------------------------------------------

type Props = {
  row: IStudentsItem;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onToggleStatus?: (id: string, status: string) => void;
  associations?: ICourseAssociation[];
  intakes?: IIntake[];
};

export function StudentsTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
  associations = [],
  intakes = [],
}: Props) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();
  const quickEnrollForm = useBoolean();

  const renderQuickEditForm = () => (
    <StudentsQuickEditForm
      currentStudents={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
    />
  );
  const renderQuickEnrollForm = () => (
    <StudentQuickEnrollForm
      open={quickEnrollForm.value}
      onClose={quickEnrollForm.onFalse}
      studentId={row.id}
      associations={associations}
      intakes={intakes}
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
        <MenuItem href={editHref} onClick={quickEditForm.onTrue}>
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
        <MenuItem href={editHref} onClick={quickEnrollForm.onTrue}>
          <Iconify icon="solar:check-circle-bold" />
          Enroll
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (onToggleStatus) {
              const newStatus = row.status;
              onToggleStatus(row.id, newStatus);
            }
            menuActions.onClose();
          }}
          sx={{ color: row.status === 'Enrolled' ? 'warning.main' : 'success.main' }}
        >
          <Iconify
            icon={
              row.status === 'Enrolled'
                ? 'material-symbols:toggle-off'
                : 'material-symbols:toggle-on'
            }
          />
          {row.status === 'Enrolled' ? 'Deactivate' : 'Activate'}
        </MenuItem>

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

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>

        <TableCell>
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            {/* TODO Add avatar URL */}
            <Avatar alt={row.firstName} src={row?.coverPhoto} />

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link
                component={RouterLink}
                href={editHref}
                color="inherit"
                sx={{ cursor: 'pointer' }}
              >
                {row.firstName} {row.lastName}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Box>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.sex}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.nationality}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phoneNumber}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.universityName}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.courseName}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'Deferred' && 'default') || // maybe gray/default for free
              (row.status === 'Enrolled' && 'success') || // green for enrolled (like active)
              (row.status === 'Withdrawn' && 'warning') || // orange/yellow for unrolled (like inactive)
              'default' // fallback
            }
          >
            {/* TODO */}
            {row.status}
          </Label>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* <Tooltip title="Quick Edit" placement="top" arrow>
              <IconButton
                color={quickEditForm.value ? 'inherit' : 'default'}
                onClick={quickEditForm.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip> */}

            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      {renderQuickEditForm()}
      {renderQuickEnrollForm()}
      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
