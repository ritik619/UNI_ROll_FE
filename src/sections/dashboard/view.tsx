'use client';

import type { DashboardStats, EarningsSummaryResponse } from 'src/types/dashboard';

import { useState, useEffect } from 'react';
import React from 'react';
import { Box, Divider } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchDashboardStats } from 'src/services/dashboard/fetch-stats';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import { skeleton } from 'src/theme/core/components/skeleton';
import UserDetailsCard from './user-details-card';
// ----------------------------------------------------------------------

// Custom hook for counting animation
function useCountAnimation(endValue: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * endValue);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [endValue, duration]);

  return count;
}

// Card configurations
const CARD_CONFIGS = [
  {
    title: 'Total Students',
    key: 'totalStudents',
    icon: 'solar:users-group-rounded-bold',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #67E8F9 100%)',
  },
  {
    title: 'Enrolled Students',
    key: 'enrolledStudents',
    icon: 'solar:user-check-rounded-bold',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
  },
  {
    title: 'Unenrolled Students',
    key: 'unenrolledStudents',
    icon: 'solar:user-cross-rounded-bold',
    color: '#B91C1C',
    gradient: 'linear-gradient(135deg, #B91C1C 0%, #EF4444 100%)',
  },
  {
    title: 'Total Agents',
    key: 'totalAgents',
    icon: 'solar:user-id-bold',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
    roles: ['admin'],
  },
  // {
  //   title: 'Total Earnings',
  //   key: 'totalEarnings',
  //   icon: 'solar:money-bag-bold',
  //   color: '#F59E0B',
  //   gradient: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
  //   isCurrency: true,
  // },
  {
    title: 'Total Universities',
    key: 'totalUniversities',
    icon: 'solar:buildings-bold',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
  },
  {
    title: 'Total Courses',
    key: 'totalCourses',
    icon: 'solar:book-bold',
    color: '#DB2777',
    gradient: 'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)',
  },
];

export function DashboardView() {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [earningsByIntake, setEarningsByIntake] = useState<
    EarningsSummaryResponse['earningsByIntake']
  >([]);
  const [earningsByUniversity, setEarningsByUniversity] = useState<
    EarningsSummaryResponse['earningsByUniversity']
  >([]);
  const [currencyCode, setCurrencyCode] = useState<string>('EURO');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const userRole = user?.role;
  const isAgent = userRole == 'agent';

  // Filter cards based on user role
  const filteredCards = CARD_CONFIGS.filter(
    (card) => !card.roles || card.roles.includes(userRole ?? 'user')
  );

  // Create animated values for each stat
  const animatedStudents = useCountAnimation(stats?.totalStudents ?? 0);
  const animatedEnrolledStudents = useCountAnimation(stats?.enrolledStudents ?? 0);
  const animatedUnenrolledStudents = useCountAnimation(stats?.unenrolledStudents ?? 0);
  const animatedAgents = useCountAnimation(stats?.totalAgents ?? 0);
  const animatedEarnings = useCountAnimation(stats?.totalEarnings ?? 0);
  const animatedUniversities = useCountAnimation(stats?.totalUniversities ?? 0);
  const animatedCourses = useCountAnimation(stats?.totalCourses ?? 0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data[0]);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // You might want to show an error message to the user here
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);
  // skeleton
  if (loading) {
    return (
      <DashboardContent>
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Dashboard Overview
          </Typography>

          <Card sx={{ p: 3 }}>
            <Grid
              container
              spacing={3}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {filteredCards.map((card) => (
                <Grid
                  key={card.title}
                  sx={{
                    width: '100%',
                  }}
                >
                  <Card
                    sx={{
                      p: 4,
                      height: '180px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ height: '100%', px: 2 }}
                    >
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: alpha(card.color, 0.1),
                        }}
                      >
                        <Skeleton variant="circular" width={40} height={40} />
                      </Box>

                      <Stack spacing={1} alignItems="flex-end">
                        <Skeleton variant="text" width={100} height={40} />
                        <Skeleton variant="text" width={120} height={24} />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Stack>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent className="dashboard">
      <Stack className="body" spacing={3}>
        <Typography className="title" variant="h4" sx={{ mb: 2 }}>
          Dashboard Overview
        </Typography>

        <Card
          className="main card"
          sx={{
            p: 3,
            display: isAgent ? 'flex' : 'block',
            width: 'auto',
            height: 'auto',

            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
          <Grid
            className="main grid"
            container
            spacing={3}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              display: 'grid',
              width: '100%',
              height: '100%',

              gridTemplateColumns: {
                xs: isAgent ? 'repeat(1, 1fr)' : 'repeat(1, 1fr)',
                sm: isAgent ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                md: isAgent ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                lg: isAgent ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {isAgent && <UserDetailsCard />}
            {filteredCards.map((card) => {
              let animatedValue: number;
              switch (card.key) {
                case 'totalStudents':
                  animatedValue = animatedStudents;
                  break;
                case 'enrolledStudents':
                  animatedValue = animatedEnrolledStudents;
                  break;
                case 'unenrolledStudents':
                  animatedValue = animatedUnenrolledStudents;
                  break;
                case 'totalAgents':
                  animatedValue = animatedAgents;
                  break;
                case 'totalEarnings':
                  animatedValue = animatedEarnings;
                  break;
                case 'totalUniversities':
                  animatedValue = animatedUniversities;
                  break;
                case 'totalCourses':
                  animatedValue = animatedCourses;
                  break;
                default:
                  animatedValue = 0;
              }

              const displayValue = card.isCurrency
                ? `$${animatedValue.toLocaleString()}`
                : animatedValue.toLocaleString();

              return (
                <Grid
                  className="grid details"
                  key={card.title}
                  sx={{
                    // width: '25vw',
                    height: '25vh',
                  }}
                >
                  <Card
                    className="card details"
                    sx={{
                      p: 4,
                      width: 'auto',
                      height: '100%',
                      alignContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                        '& .icon-wrapper': {
                          transform: 'scale(1.1)',
                        },
                      },
                    }}
                  >
                    {/* Background gradient */}
                    <Box
                      className="box details"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        background: card.gradient,
                      }}
                    />

                    <Stack
                      className="stack details"
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ px: 2 }}
                    >
                      <Box
                        className="icon-wrapper"
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: alpha(card.color, 0.1),
                          transition: 'transform 0.3s ease-in-out',
                        }}
                      >
                        <Iconify icon={card.icon} width={40} height={40} color={card.color} />
                      </Box>

                      <Stack spacing={1} alignItems="flex-end">
                        <Typography
                          variant="h3"
                          sx={{
                            color: 'text.primary',
                            fontWeight: 700,
                            lineHeight: 1.2,
                          }}
                        >
                          {displayValue}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
