import React from 'react';
import { Typography, Box, Paper, Divider, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EligibilitySummary from './EligibilitySummary'; // Import the new component

type Badge = {
  iconUrl?: string;
  name: string;
  level?: string;
  category: string;
  subCategory: string;
};

type User = {
  yearJoined: string;
  name: string;
  rank: string;
  dob: string;
  profileImageUrl?: string;
  badges?: Badge[];
  squad: string;
  platoon: string;
};

const requiredBadges = [
  "Target Badge Basic",
  "Drill Advanced",
  "Recruitment Basic",
  "Christian Education Advanced",
  "NCO Proficiency Star",
];

const checkRequiredBadges = (user: User): string[] => {
  const userBadges = user.badges || [];
  let missingRequiredBadges: string[] = [];

  requiredBadges.forEach((badge) => {
    const badgeExists = userBadges.some(
      (b) => {
        const badgeNameWithLevel = `${b.name.trim()} ${b.level?.trim() || ''}`.toLowerCase();
        const requiredBadgeWithLevel = badge.toLowerCase();
        return badgeNameWithLevel === requiredBadgeWithLevel || 
               (b.level === undefined && b.name.trim().toLowerCase() === requiredBadgeWithLevel);
      }
    );
    if (!badgeExists) {
      missingRequiredBadges.push(badge);
    }
  });

  return missingRequiredBadges;
};

const checkMembershipDuration = (user: User): boolean => {
  const yearJoined = parseInt(user.yearJoined, 10);
  const currentYear = new Date().getFullYear();
  return currentYear - yearJoined >= 3;
};

const getUniqueProficiencyBadges = (user: User): Record<string, Set<string>> => {
  const proficiencyBadges = (user.badges || []).filter(
    (badge) =>
      badge.category === 'proficiencyAwards' &&
      !requiredBadges.includes(`${badge.name.trim()} ${badge.level?.trim() || ''}`) &&
      badge.subCategory !== 'compulsory'
  );

  const badgeMap: Record<string, Set<string>> = {};
  proficiencyBadges.forEach((badge) => {
    const group = badge.subCategory || 'Uncategorized';
    if (!badgeMap[group]) {
      badgeMap[group] = new Set();
    }
    badgeMap[group].add(badge.name.trim());
  });

  return badgeMap;
};

const countAdvancedBadges = (user: User): number => {
  const proficiencyBadges = (user.badges || []).filter(
    (badge) =>
      badge.category === 'proficiencyAwards' &&
      badge.level?.toLowerCase() === 'advanced' &&
      !requiredBadges.includes(`${badge.name.trim()} ${badge.level?.trim() || ''}`)
  );

  const uniqueAdvancedBadges = new Set(proficiencyBadges.map((badge) => badge.name.trim()));
  return uniqueAdvancedBadges.size;
};

const checkEligibilityForProficiency = (user: User): string[] => {
  const proficiencyBadgesByGroup = getUniqueProficiencyBadges(user);
  const totalBadges = Object.values(proficiencyBadgesByGroup).reduce((sum, badges) => sum + badges.size, 0);
  const advancedBadgeCount = countAdvancedBadges(user);

  let missingCriteria: string[] = [];

  if (totalBadges < 6) {
    missingCriteria.push('You need at least 6 unique proficiency badges.');
  }

  if (advancedBadgeCount < 4) {
    missingCriteria.push('You need at least 4 advanced proficiency badges.');
  }

  const groups = ['groupA', 'groupB', 'groupC', 'groupD'];
  groups.forEach((group) => {
    if (!proficiencyBadgesByGroup[group] || proficiencyBadgesByGroup[group].size === 0) {
      missingCriteria.push(`You need at least one badge from ${group}.`);
    }
  });

  return missingCriteria;
};

const checkIfPresidentBadgeExists = (user: User): boolean => {
  return user.badges?.some(
    (badge) => badge.name.toLowerCase() === "president's badge"
  ) || false;
};

const EligibilityChecker: React.FC<{ user: User }> = ({ user }) => {
  const missingRequiredBadges = checkRequiredBadges(user);
  const isMembershipSufficient = checkMembershipDuration(user);
  const proficiencyCriteria = checkEligibilityForProficiency(user);

  const proficiencyBadgesByGroup = getUniqueProficiencyBadges(user);
  const totalProficiencyBadges = Object.values(proficiencyBadgesByGroup).reduce(
    (sum, badges) => sum + badges.size,
    0
  );
  const totalAdvancedBadges = countAdvancedBadges(user);

  const isPresidentBadge = checkIfPresidentBadgeExists(user);

  // Define criteria with statuses
  const criteria = [
    {
      text: 'At least 3 years of membership.',
      fulfilled: isMembershipSufficient,
    },
    ...requiredBadges.map((badge) => ({
      text: `Possess the badge: ${badge}.`,
      fulfilled: !missingRequiredBadges.includes(badge),
    })),
    {
      text: 'At least 6 unique proficiency badges.',
      fulfilled: totalProficiencyBadges >= 6,
    },
    {
      text: 'At least 4 advanced proficiency badges.',
      fulfilled: totalAdvancedBadges >= 4,
    },
    {
      text: 'At least one badge from each group (A, B, C, D).',
      fulfilled: !proficiencyCriteria.some((c) => c.startsWith('You need at least one badge from')),
    },
  ];

  // Split fulfilled and unfulfilled criteria for better grouping
  const fulfilledCriteria = criteria.filter((criterion) => criterion.fulfilled);
  const unfulfilledCriteria = criteria.filter((criterion) => !criterion.fulfilled);

  if (unfulfilledCriteria.length === 0) {
    return (
      <Box sx={{ padding: 0.5}}>
        <EligibilitySummary isPresidentBadge={isPresidentBadge} /> {/* Use the imported component */}
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Eligibility Checker for President's Badge
      </Typography>

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1">
          Total Proficiency Badges: <strong>{totalProficiencyBadges}</strong>
        </Typography>
        <Typography variant="body1">
          Total Advanced Badges: <strong>{totalAdvancedBadges}</strong>
        </Typography>
        <Divider sx={{ marginY: 1 }} />
      </Box>

      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>
          Unfulfilled Criteria
        </Typography>
        <Stack spacing={1}>
          {unfulfilledCriteria.map((criterion, index) => (
            <Box key={index} display="flex" alignItems="center">
              <CancelIcon sx={{ color: 'error.main', marginRight: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                {criterion.text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Fulfilled Criteria
        </Typography>
        <Stack spacing={1}>
          {fulfilledCriteria.map((criterion, index) => (
            <Box key={index} display="flex" alignItems="center">
              <CheckCircleIcon sx={{ color: 'success.main', marginRight: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 'normal',
                  textDecoration: 'line-through',
                }}
              >
                {criterion.text}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default EligibilityChecker;
