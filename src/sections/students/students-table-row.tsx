// Types
import type { IIntake } from 'src/types/intake';
import type { ICourseAssociation } from 'src/types/courseAssociation';
import type { IStudentsItem, IStudentStatus } from 'src/types/students';
import type { IEarning, PaymentStatus, IPaymentAssociation } from 'src/types/paymentAssociation';

// React and Hooks
import { useState, useEffect } from 'react';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import { useTheme } from '@mui/material/styles';
// MUI Components
import {
  Box,
  Link,
  Stack,
  Paper,
  Button,
  Avatar,
  Divider,
  MenuList,
  MenuItem,
  TableRow,
  Collapse,
  TableCell,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
// Routes
import { RouterLink } from 'src/routes/components';

// Utilities and Constants
import { fCurrency } from 'src/utils/format-number';

import { fetchEarnings } from 'src/services/students/fetchPayments';
import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

// Custom Components
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { useAuthContext } from 'src/auth/hooks';

import { StudentsQuickEditForm } from './students-quick-edit-form';
import { StudentQuickEnrollForm } from './students-quick-enroll-form';
import { StudentQuickAddPaymentAssociationForm } from './student-quick-add-payment-association-form';
import { createPaymentAssociation } from 'src/services/students/attachPayments';

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
  onEnroll?: (
    studentId: string,
    data: { universityId: string; courseId: string; intakeId: string }
  ) => void;
  onUnenroll?: (studentId: string) => void;
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
  onEnroll,
  onUnenroll,
}: Props) {
  const theme = useTheme();
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const unenrollDialog = useBoolean();
  const quickEditForm = useBoolean();
  const quickEnrollForm = useBoolean();
  const paymentsMenuActions = usePopover();
  const [payments, setPayments] = useState<IPaymentAssociation[]>([]);
  const [loading, setLoading] = useState(false);
  const collapseRow = useBoolean();
  const [earning, setEarning] = useState<IEarning>();
  const quickAddPayment = useBoolean();
  const paymentMenuActions = usePopover();
  const paymentDeleteDialog = useBoolean();
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { user } = useAuthContext();
  const userRole = user?.role;
  const isRefferal = user?.isReferral ? user?.isReferral : false;
  const isAdmin = userRole == 'admin';
  const isAgent = userRole == 'agent';

  // Fetch earnings when component mounts
  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        const earningsData = await fetchEarnings({
          agentId: row.agentId ?? '',
          intakeId: row.intakeId ?? '',
          universityId: row.universityId ?? '',
          studentId: row.id,
          courseId: row.courseId ?? '',
        });
        if (earningsData.earnings[0]) {
          setEarning(earningsData.earnings[0]);
          setPayments(earningsData.earnings[0]?.payments ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
        toast.error('Failed to fetch earnings data');
      } finally {
        setLoading(false);
      }
    };
    {
      row.status === 'Enrolled' && fetchEarningsData();
    }
  }, [row.id, row.agentId, row.intakeId, row.universityId, row.courseId, row.status]);

  const handleUnenroll = async () => {
    try {
      // Call the remove-intake-link API
      await authAxiosInstance.patch(endpoints.students.removeIntakeLink(row.id));

      // Call the onUnenroll callback if provided
      if (onUnenroll) {
        onUnenroll(row.id);
      }

      toast.success('Student unenrolled successfully');
      unenrollDialog.onFalse();
      menuActions.onClose();
    } catch (error) {
      console.error('Error unenrolling student:', error);
      toast.error('Failed to unenroll student');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.stopPropagation();
    setMenuId(index);
    paymentMenuActions.onOpen(event);
  };

  const handleMenuClose = () => {
    setMenuId(null);
    paymentMenuActions.onClose();
  };

  const renderPrimaryRow = () => (
    <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar alt={row.firstName} src={row?.coverPhoto} />

          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Link
              component={RouterLink}
              href={isRefferal ? '' : paths.dashboard.students.details(row.id)}
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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.leadNumber}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.nationality}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phoneNumber}</TableCell>
      {isRefferal ? (
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.notes}</TableCell>
      ) : (
        <>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.universityName}</TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.courseName}</TableCell>
        </>
      )}

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status === 'Deferred' && 'default') ||
            (row.status === 'Enrolled' && 'success') ||
            (row.status === 'Withdrawn' && 'warning') ||
            'default'
          }
        >
          {row.status}
        </Label>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {earning && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: (() => {
                      if (earning.paidAmount === 0) return 'text.secondary'; // gray for not paid
                      if (earning.paidAmount < earning.totalCommission) return 'warning.main'; // yellow for in progress
                      if (earning.paidAmount === earning.totalCommission) return 'success.main'; // green for fully paid
                      return 'error.main'; // red for overpaid
                    })(),
                  }}
                >
                  {fCurrency(earning.paidAmount)}/{fCurrency(earning.totalCommission)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            disabled={row.status !== 'Enrolled'}
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
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={9}>
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5, p: 2 }}>
            {isAdmin && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
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
                </Box>
                <Divider sx={{ mb: 3 }} />
              </>
            )}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : payments.length > 0 ? (
              <Box>
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
                  <Box sx={{ width: '15%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Payment #
                    </Typography>
                  </Box>

                  <Box sx={{ width: '20%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Amount
                    </Typography>
                  </Box>

                  <Box sx={{ width: '25%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Description
                    </Typography>
                  </Box>

                  <Box sx={{ width: '20%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Date
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'text.secondary', textAlign: 'right' }}
                    >
                      Status
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  {payments.map((payment, index) => (
                    <Box
                      key={payment.id}
                      sx={(theme) => ({
                        display: 'flex',
                        alignItems: 'center',
                        p: theme.spacing(2, 2.5),
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        boxShadow: theme.shadows[1],
                      })}
                    >
                      {/* Payment Number - 15% */}
                      <Box sx={{ width: '15%' }}>
                        <Typography variant="subtitle2">
                          Payment #{payment.paymentNumber}
                        </Typography>
                      </Box>

                      {/* Amount - 20% */}
                      <Box sx={{ width: '20%' }}>
                        <Typography variant="subtitle2">{fCurrency(payment.amount)}</Typography>
                      </Box>

                      {/* Description - 25% */}
                      <Box sx={{ width: '25%' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {payment.description || '—'}
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
                            (payment.status === 'Paid' && 'success') ||
                            (payment.status === 'Pending' && 'warning') ||
                            (payment.status === 'Failed' && 'error') ||
                            'default'
                          }
                          sx={{ p: 2, mr: 2 }}
                        >
                          {payment.status}
                        </Label>
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={(event) => handleMenuOpen(event, index)}
                          >
                            <Iconify icon="eva:more-vertical-fill" width={18} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  No payments found
                </Typography>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={quickAddPayment.onTrue}
                    startIcon={<Iconify icon="mingcute:add-line" />}
                  >
                    Add First Payment
                  </Button>
                )}
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
      universityId={row.universityId ?? ''}
      agentId={row.agentId ?? ''}
      courseId={row.courseId ?? ''}
      intakeId={row.intakeId ?? ''}
      earning={earning}
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
      onEnroll={onEnroll}
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

        {row.status !== 'Enrolled' && !isRefferal ? (
          <MenuItem
            href={paths.dashboard.students.details(row.id)}
            onClick={quickEnrollForm.onTrue}
          >
            <Iconify icon="solar:check-circle-bold" />
            Enroll
          </MenuItem>
        ) : (
          !isRefferal && (
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
          )
        )}

        {/* <MenuItem
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
        </MenuItem> */}

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

  const handleDeletePayment = async () => {
    if (!paymentToDelete || !earning?.id) {
      toast.error('Missing payment or earning information');
      return;
    }

    try {
      const newPays = payments.filter((_, i) => i != paymentToDelete);
      const { data } = await createPaymentAssociation({
        studentId: row.id,
        payments: newPays.map((i) => ({
          amount: i.amount,
          description: i.description,
          status: i.status,
          paymentDate: i.paymentDate,
          paymentNumber: i.paymentNumber,
        })),
        universityId: row.universityId,
        agentId: row.agentId,
        intakeId: row.intakeId,
        totalCommission: earning?.totalCommission,
        commissionCurrency: earning?.commissionCurrency,
      } as any);
      setPayments(newPays);

      toast.success('Payment deleted successfully');
      setPaymentToDelete(null);
      setEarning(data);
      setPayments(data.payments);
      paymentDeleteDialog.onFalse();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    }
  };

  const renderConfirmPaymentDeleteDialog = () => (
    <ConfirmDialog
      open={paymentDeleteDialog.value}
      onClose={paymentDeleteDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={handleDeletePayment}>
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
      {renderConfirmPaymentDeleteDialog()}
      {renderUnenrollDialog()}
      {payments.map((payment, index) => (
        <CustomPopover
          key={`popover-${payment.id}`}
          open={index === menuId && paymentMenuActions.open}
          anchorEl={paymentMenuActions.anchorEl}
          onClose={handleMenuClose}
          slotProps={{
            arrow: { placement: 'right-top' },
            paper: {
              onClick: (e) => e.stopPropagation(),
            },
          }}
        >
          <MenuList>
            <MenuItem
              onClick={async () => {
                try {
                  const newStatus: PaymentStatus = payment.status === 'Paid' ? 'Pending' : 'Paid';
                  handleMenuClose();
                  if (!earning?.id) {
                    toast.error('Earning ID is missing');
                    return;
                  }
                  await authAxiosInstance.patch(
                    `${endpoints.earnings.details(earning.id)}/payments/${payment.id}`,
                    {
                      amount: payment.amount,
                      status: newStatus,
                      description: payment.description,
                    }
                  );

                  // Update local state
                  const updatedPayments = payments.map((p) =>
                    p.id === payment.id ? { ...p, status: newStatus } : p
                  );
                  setPayments(updatedPayments);

                  toast.success(`Payment marked as ${newStatus}`);
                } catch (error) {
                  console.error(error);
                  toast.error('Failed to update payment status');
                }
              }}
              sx={{
                color: payment.status === 'Paid' ? 'warning.main' : 'success.main',
              }}
            >
              <Iconify
                icon={
                  payment.status === 'Paid'
                    ? 'material-symbols:toggle-off'
                    : 'material-symbols:toggle-on'
                }
                width={16}
                sx={{ mr: 1 }}
              />
              {payment.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
            </MenuItem>

            <MenuItem
              onClick={() => {
                setPaymentToDelete(index);
                paymentDeleteDialog.onTrue();
                handleMenuClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={16} sx={{ mr: 1 }} />
              Delete Payment
            </MenuItem>
          </MenuList>
        </CustomPopover>
      ))}
    </>
  );
}
