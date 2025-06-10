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
  // const userRole = user?.role;
  // const isAgent = userRole == 'agent';

  // Dummy user data for demonstration. Replace with your actual user prop.
  // const user = {
  //   firstName: 'test',
  //   lastName: 'agent 1',
  //   email: 'testagent1@gmail.com',
  //   dateOfBirth: { seconds: 1678886400 }, // Example: a valid date (Mar 15, 2023)
  //   // dateOfBirth: { seconds: 0 }, // Example: invalid date (will show 'Invalid Date')
  //   // dateOfBirth: undefined, // Example: missing date (will show 'N/A')
  //   phoneNumber: '123-456-7890',
  //   address: 'S-518, Some Road, Some Area, Some City, Some State', // Longer address for testing
  //   postCode: '462003',
  //   bankDetails: {
  //     sortCode: '12-12-12',
  //     accountNumber: '12345678',
  //   },
  //   utrNumber: '1234567890',
  // };

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
          background: theme.palette.grey[50], // Or a very light subtle color from your theme
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
            <SectionHeader sx={{ mb: 2 }}>
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
                <Iconify icon={'solar:user-rounded-bold'} width={60} height={60} color={'B91C1C'} />

                {/* <Icon
                  icon="mdi:account-outline"
                  style={{ fontSize: 40, color: theme.palette.primary.main }}
                /> */}
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 700, color: 'B91C1C' }}>
                {`${user?.firstName || 'N/A'} ${user?.lastName || ''}`}
              </Typography>
            </SectionHeader>
            <Divider sx={{ borderStyle: 'dashed', borderColor: theme.palette.divider, mb: 2 }} />{' '}
            {/* Divider below header */}
            {/* Basic Details */}
            <Box className="box user-basic-details">
              <DetailItem>
                {/* Iconify: Email icon */}
                <Icon
                  icon="mdi:email-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Email:{' '}
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
              <DetailItem>
                {/* Iconify: Calendar icon */}
                <Icon
                  icon="mdi:calendar-today"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Date of Birth:{' '}
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
                <DetailItem>
                  {/* Iconify: Phone icon */}
                  <Icon
                    icon="mdi:phone-outline"
                    color={theme.palette.action.active}
                    style={{ fontSize: 'small' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Phone Number:
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
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Address Details
              </Typography>
            </SectionHeader>
            <Divider sx={{ borderStyle: 'dashed', borderColor: theme.palette.divider, mb: 2 }} />
            <Box className="box user-address-details">
              <DetailItem>
                {/* Iconify: Location icon */}
                <Icon
                  icon="mdi:map-marker-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Address:{' '}
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
              <DetailItem>
                {/* No icon, align using ml for text */}
                <Typography variant="body2" color="text.secondary" sx={{ ml: '29px' }}>
                  Post Code:{' '}
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
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Bank Details
              </Typography>
            </SectionHeader>
            <Divider sx={{ borderStyle: 'dashed', borderColor: theme.palette.divider, mb: 2 }} />
            <Box className="box user-bank-details">
              <DetailItem>
                {/* Iconify: Credit card icon */}
                <Icon
                  icon="mdi:credit-card-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Sort Code:{' '}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {user?.bankDetails?.sortCode || 'N/A'}
                  </Typography>
                </Typography>
              </DetailItem>
              <DetailItem>
                {/* Iconify: Key icon */}
                <Icon
                  icon="mdi:key-outline"
                  color={theme.palette.action.active}
                  style={{ fontSize: 'small' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Account Number:{' '}
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
              <DetailItem>
                {/* No icon, align using ml for text */}
                <Typography variant="body2" color="text.secondary" sx={{ ml: '29px' }}>
                  UTR Number:{' '}
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
