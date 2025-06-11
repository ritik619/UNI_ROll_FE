import React from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  Divider,
  Grid2,
  styled,
  useTheme, // Import useTheme hook to access theme palette
} from '@mui/material';
import { Icon } from '@iconify/react'; // Import Icon component from Iconify
import { useAuthContext } from 'src/auth/hooks';
import { Iconify } from 'src/components/iconify';

// Custom StyledBox for consistent spacing and styling of detail items
const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start', // Align to start for better multi-line text
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5), // More bottom margin for better separation
  '&:last-child': {
    marginBottom: 0,
  },
}));

// Custom StyledHeader for section titles with prominent icons
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5), // Increased gap for icon and text
  marginBottom: theme.spacing(1.5),
}));

// Helper function to format date
const formatDate = (seconds: number) => {
  // Added type annotation 'number' for seconds
  if (typeof seconds === 'undefined' || seconds === null) return 'N/A';
  const date = new Date(seconds * 1000);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toDateString();
};

const UserDetailsCard = () => {
  const theme = useTheme();

  const { user } = useAuthContext();
  console.log('user', user);
  const sortCode = user?.bankDetails?.sortCode;

  // Format the sortCode if it exists and is 6 digits long
  const formattedSortCode = sortCode
    ? `${sortCode.substring(0, 2)}-${sortCode.substring(2, 4)}-${sortCode.substring(4, 6)}`
    : 'N/A';
  return (
    <Grid2
      sx={{
        gridRowStart: 1, // These styles help position your UserDetails card in the grid
        gridRowEnd: 3,
        width: '100%',
        height: '100%',
      }}
    >
      <Card
        className="card user-details"
        sx={{
          gridRowStart: 1,
          gridRowEnd: 3,
          p: 3, // Slightly reduced padding to match other cards' visual density
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3, // Consistent rounded corners
          boxShadow: 3, // Consistent shadow
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)', // Consistent lift
            boxShadow: 8, // Consistent shadow on hover
          },
          // Main background for the card - a very light, almost white grey
          backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f4f6f8' : '#2b3440'), // <-- elegant balance light - f4f6f8 dark - 2b3440
        }}
      >
        {/* Removed the overly subtle background gradient box for simplicity and better match */}
        <Stack
          className="stack user-content"
          spacing={3} // Adjusted spacing between major sections
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* User Header Section (Name and basic details) */}
          <Box className="box user-basic-header">
            <SectionHeader sx={{ m: 1 }}>
              {/* Iconify: User icon */}
              <Box
                className="icon-wrapper"
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // background: 'B91C1C',
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                <Iconify
                  icon={'solar:user-rounded-bold-duotone'}
                  width={50}
                  height={50}
                  color={'#B91C1C'}
                />
              </Box>

              <Typography
                variant="h2"
                sx={{ font: 'initial', fontWeight: 500, color: theme.palette.text.primary }}
              >
                {`${user?.firstName || 'N/A'} ${user?.lastName || ''}`}
              </Typography>
            </SectionHeader>
            <Divider
              sx={{
                height: '2px',
                background: `linear-gradient(to right, ${theme.palette.divider} 0%, transparent 100%)`,
                border: 'none',
                m: 1,
              }}
            />
            {/* Divider below header */}
            {/* Basic Details */}
            <Box className="box user-basic-details-duotone" paddingLeft={'10px'}>
              <DetailItem
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                {/* Iconify: Email icon */}
                <Icon
                  icon="mdi:email-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {'Email : '}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {user?.email || 'N/A'}
                  </Typography>
                </Typography>
              </DetailItem>
              <DetailItem
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                {/* Iconify: Calendar icon */}
                <Icon
                  icon="mdi:calendar-today"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {'Date of Birth : '}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {formatDate(user?.dateOfBirth?.seconds)}
                  </Typography>
                </Typography>
              </DetailItem>
              {user?.phoneNumber != null && (
                <DetailItem
                  sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                >
                  {/* Iconify: Phone icon */}
                  <Icon
                    icon="mdi:phone-outline"
                    color={theme.palette.action.active}
                    style={{ fontSize: 'small' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {'Phone Number : '}
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.primary"
                      sx={{ fontWeight: 500 }}
                    >
                      {user?.phoneNumber || 'N/A'}
                    </Typography>
                  </Typography>
                </DetailItem>
              )}
            </Box>
          </Box>

          {/* Address Details */}
          <Box className="box user-address">
            <SectionHeader>
              {/* Iconify: Home icon */}
              <Icon
                icon="mdi:home-outline"
                style={{ fontSize: 28, color: theme.palette.info.main }}
              />
              <Typography
                variant="h6"
                sx={{ font: 'initial', fontWeight: 600, color: theme.palette.text.primary }}
              >
                {'Address Details'}
              </Typography>
            </SectionHeader>
            <Divider
              sx={{
                height: '2px',
                background: `linear-gradient(to right, ${theme.palette.divider} 0%, transparent 100%)`,
                border: 'none',
                m: 1,
              }}
            />
            <Box className="box user-address-details" paddingLeft={'10px'}>
              <DetailItem
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                {/* Iconify: Location icon */}
                <Icon
                  icon="mdi:map-marker-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {'Address : '}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {user?.address || 'N/A'}
                  </Typography>
                </Typography>
              </DetailItem>
              <DetailItem
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                {/* Iconify: Location icon */}
                <Icon
                  icon="mdi:map-marker"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {'Post Code : '}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {user?.postCode || 'N/A'}
                  </Typography>
                </Typography>
              </DetailItem>
            </Box>
          </Box>

          {/* Bank Details */}
          <Box className="box user-bank">
            <SectionHeader>
              {/* Iconify: Bank icon */}
              <Icon
                icon="mdi:bank-outline"
                style={{ fontSize: 28, color: theme.palette.success.main }}
              />
              <Typography
                variant="h6"
                sx={{ font: 'initial', fontWeight: 600, color: theme.palette.text.primary }}
              >
                {'Bank Details'}
              </Typography>
            </SectionHeader>
            <Divider
              sx={{
                height: '2px',
                background: `linear-gradient(to right, ${theme.palette.divider} 0%, transparent 100%)`,
                border: 'none',
                m: 1,
              }}
            />
            <Box className="box user-bank-details" paddingLeft={'10px'}>
              <DetailItem
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                {/* Iconify: Key icon */}
                <Icon
                  icon="mdi:key-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {'Account Number : '}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {user?.bankDetails?.accountNumber || 'N/A'}
                  </Typography>
                </Typography>
              </DetailItem>
              <DetailItem
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                {/* Iconify: Credit card icon */}
                <Icon
                  icon="mdi:credit-card-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {'Sort Code :'}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {formattedSortCode || 'N/A'}
                  </Typography>
                </Typography>
              </DetailItem>

              <DetailItem
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                {/* Iconify: Credit card icon */}
                <Icon
                  icon="mdi:bank-transfer"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  {'UTR Number : '}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {user?.utrNumber || 'N/A'}
                  </Typography>
                </Typography>
              </DetailItem>
            </Box>
          </Box>
        </Stack>
      </Card>
    </Grid2>
  );
};

export default UserDetailsCard;
