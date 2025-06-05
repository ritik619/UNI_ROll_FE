// Types
import type { IIntake } from 'src/types/intake';
import type { IStudentsItem, IStudentStatus } from 'src/types/students';
import type { ICourseAssociation } from 'src/types/courseAssociation';
import type { IPaymentAssociation } from 'src/types/paymentAssociation';

// React and Hooks
import { useState } from 'react';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

// MUI Components
import {
  Box,
  Link,
  Stack,
  Button,
  Avatar,
  MenuList,
  MenuItem,
  TableRow,
  TableCell,
  IconButton,
  Checkbox,
  Collapse,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';

// Utilities and Constants
import { fCurrency } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

// Routes
import { RouterLink } from 'src/routes/components';

// Custom Components
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { StudentsQuickEditForm } from './students-quick-edit-form';
import { StudentQuickEnrollForm } from './students-quick-enroll-form';
import { StudentQuickAddPaymentAssociationForm } from './student-quick-add-payment-association-form';

// ----------------------------------------------------------------------

type Props = {
  row: IStudentsItem;
  selected: boolean;
  editHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onToggleStatus?: (id: string, status: IStudentStatus) => void;
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
  const unenrollDialog = useBoolean();
  const quickEditForm = useBoolean();
  const quickEnrollForm = useBoolean();
  const paymentsMenuActions = usePopover(); // For course row actions

  // State to track course being deleted

  const [payments, setPayments] = useState<IPaymentAssociation[]>([]);
  const [loading, setLoading] = useState(false);
  const collapseRow = useBoolean();
  const quickAddPayment = useBoolean();
  const paymentMenuActions = usePopover(); // custom hook like `useBoolean`, or a similar popover hook
  const paymentDeleteDialog = useBoolean();
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const handleUnenroll = async () => {
    try {
      // Call the remove-intake-link API
      await authAxiosInstance.patch(endpoints.students.removeIntakeLink(row.id));

      toast.success('Student unenrolled successfully');
      unenrollDialog.onFalse();
      menuActions.onClose();
    } catch (error) {
      console.error('Error unenrolling student:', error);
      toast.error('Failed to unenroll student');
    }
  };
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
          {/* TODO Add avatar URL */}
          <Avatar alt={row.firstName} src={row?.coverPhoto} />

          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Link
              component={RouterLink}
              href={paths.dashboard.students.details(row.id)}
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
                Payments {!loading && `(${payments.length})`}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={quickAddPayment.onTrue}
                startIcon={<Iconify icon="mingcute:add-line" sx={{ ml: 2 }} />}
              >
                Add Payment
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : payments.length > 0 ? (
              <Stack spacing={1}>
                {payments.map((payment) => (
                  <Box
                    key={payment.id}
                    sx={(theme) => ({
                      display: 'flex',
                      alignItems: 'center',
                      p: theme.spacing(1.5, 2),
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    })}
                  >
                    {/* Amount & Currency - 20% */}
                    <Box sx={{ width: '20%' }}>
                      <Typography variant="subtitle2">
                        {fCurrency(payment.amount)} {payment.currency}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {payment.paymentMethod || '—'}
                      </Typography>
                    </Box>

                    {/* Payment Date - 20% */}
                    <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                      <Iconify
                        icon="solar:calendar-line-duotone"
                        width={16}
                        sx={{ color: 'text.disabled', mr: 1 }}
                      />
                      <Typography variant="caption">
                        {new Date(payment.paymentDate).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>

                    {/* Transaction ID - 30% */}
                    <Box sx={{ width: '30%' }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {payment.transactionId || '—'}
                      </Typography>
                    </Box>

                    {/* Status and Actions */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}
                    >
                      <Label
                        variant="soft"
                        color={
                          (payment.status === 'completed' && 'success') ||
                          (payment.status === 'pending' && 'warning') ||
                          (payment.status === 'failed' && 'error') ||
                          'default'
                        }
                        sx={{ p: 2, mr: 2 }}
                      >
                        {payment.status}
                      </Label>

                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuId(`payment-menu-${payment.id}`); // ✅ set the ID separately
                          paymentMenuActions.onOpen(event); // ✅ pass only 1 argument
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" width={18} />
                      </IconButton>

                      <CustomPopover
                        open={paymentMenuActions.open}
                        anchorEl={paymentMenuActions.anchorEl}
                        onClose={paymentMenuActions.onClose}
                        slotProps={{ arrow: { placement: 'right-top' } }}
                        id={menuId ?? undefined} // use menuId here
                      >
                        <MenuList>
                          <MenuItem
                            onClick={async () => {
                              try {
                                const newStatus =
                                  payment.status === 'refunded' ? 'completed' : 'refunded';
                                // await authAxiosInstance.patch(`api/payments/${payment.id}/status`, { status: newStatus });

                                payment.status = newStatus;
                                toast.success(`Payment marked as ${newStatus}`);
                                const updated = [...payments];
                                setPayments(updated);
                                paymentMenuActions.onClose();
                              } catch (error) {
                                console.error(error);
                                toast.error('Failed to update payment status');
                              }
                            }}
                            sx={{
                              color: payment.status === 'refunded' ? 'success.main' : 'error.main',
                            }}
                          >
                            <Iconify
                              icon={
                                payment.status === 'refunded'
                                  ? 'material-symbols:toggle-on'
                                  : 'material-symbols:toggle-off'
                              }
                              width={16}
                              sx={{ mr: 1 }}
                            />
                            {payment.status === 'refunded' ? 'Mark Completed' : 'Refund Payment'}
                          </MenuItem>

                          <MenuItem
                            onClick={() => {
                              setPaymentToDelete(payment.id);
                              paymentDeleteDialog.onTrue();
                              paymentMenuActions.onClose();
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} sx={{ mr: 1 }} />
                            Delete Payment
                          </MenuItem>
                        </MenuList>
                      </CustomPopover>
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  No payments found
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={quickAddPayment.onTrue}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Add First Payment
                </Button>
              </Box>
            )}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  const renderQuickPaymentForm = () => (
    <StudentQuickAddPaymentAssociationForm
      studentId={row.id}
      open={quickAddPayment.value}
      onClose={quickAddPayment.onFalse}
    />
  );
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
        <Link
          component={RouterLink}
          href={paths.dashboard.students.edit(row.id)}
          color="inherit"
          sx={{ cursor: 'pointer' }}
        >
          <MenuItem href={paths.dashboard.students.details(row.id)}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </Link>

        {row.status !== 'Enrolled' ? (
          <MenuItem
            href={paths.dashboard.students.details(row.id)}
            onClick={quickEnrollForm.onTrue}
          >
            <Iconify icon="solar:check-circle-bold" />
            Enroll
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              unenrollDialog.onTrue();
              menuActions.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:close-circle-bold" />
            Unenroll
          </MenuItem>
        )}

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
  const renderUnenrollDialog = () => (
    <ConfirmDialog
      open={unenrollDialog.value}
      onClose={unenrollDialog.onFalse}
      title="Unenroll Student"
      content="Are you sure you want to unenroll this student? This action cannot be undone."
      action={
        <Button variant="contained" color="error" onClick={handleUnenroll}>
          Unenroll
        </Button>
      }
    />
  );

  return (
    <>
      {renderPrimaryRow()}
      {renderAssociationRow()}
      {renderQuickEditForm()}
      {renderQuickPaymentForm()}
      {renderQuickEnrollForm()}
      {renderMenuActions()}
      {renderConfirmDialog()}
      {renderUnenrollDialog()}
    </>
  );
}
