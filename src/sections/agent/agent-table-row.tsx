import type { IAgentItem } from 'src/types/agent';

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
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { AgentQuickEditForm } from './agent-quick-edit-form';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  row: IAgentItem;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onToggleStatus?: (id: string, status: 'active' | 'inactive') => void;
  triggerRefresh: () => void;
};

export function AgentTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
  onToggleStatus,
  triggerRefresh,
}: Props) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  const renderQuickEditForm = () => (
    <AgentQuickEditForm
      currentAgent={row}
      open={quickEditForm.value}
      onCloseandUpdate={(changed) => {
        quickEditForm.onFalse();
        triggerRefresh();
      }}
      onClose={quickEditForm.onFalse}
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
        <li>
          <MenuItem href={editHref} onClick={quickEditForm.onTrue}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </li>

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

        {/* <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}
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
            {/* <Avatar alt={row.firstName} src={row?.avatarUrl} /> */}

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              {row.firstName} {row.lastName}
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Box>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.utrNumber}</TableCell>

        <TableCell>
          <Stack spacing={0.5}>
            <Box component="span" sx={{ typography: 'body2' }}>
              Sort Code: {row.bankDetails?.sortCode}
            </Box>
            <Box component="span" sx={{ typography: 'body2' }}>
              Account: {row.bankDetails?.accountNumber}
            </Box>
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.postCode}</TableCell>

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
      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
