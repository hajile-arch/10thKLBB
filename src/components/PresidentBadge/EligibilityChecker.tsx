import React from 'react';
import { Typography, Box, Paper, Divider } from '@mui/material';

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
      badge.subCategory !== 'compulsory' // Exclude badges with "compulsory" subcategory
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

  // Check total proficiency badges
  if (totalBadges < 6) {
    missingCriteria.push('You need at least 6 unique proficiency badges.');
  }

  // Check advanced proficiency badges
  if (advancedBadgeCount < 4) {
    missingCriteria.push('You need at least 4 advanced proficiency badges.');
  }

  // Check badges from required groups
  const groups = ['groupA', 'groupB', 'groupC', 'groupD'];
  groups.forEach((group) => {
    if (!proficiencyBadgesByGroup[group] || proficiencyBadgesByGroup[group].size === 0) {
      missingCriteria.push(`You need at least one badge from ${group}.`);
    }
  });

  return missingCriteria;
};

const EligibilityChecker: React.FC<{ user: User }> = ({ user }) => {
  const proficiencyBadgesByGroup = getUniqueProficiencyBadges(user);
  const missingRequiredBadges = checkRequiredBadges(user);
  const isMembershipSufficient = checkMembershipDuration(user);
  const missingProficiencyCriteria = checkEligibilityForProficiency(user);

  let overallMissingCriteria: string[] = [];

  // Check if required badges are missing
  if (missingRequiredBadges.length > 0) {
    overallMissingCriteria.push(`Missing required badges: ${missingRequiredBadges.join(', ')}`);
  }

  // Check if membership is sufficient
  if (!isMembershipSufficient) {
    overallMissingCriteria.push('You need at least 3 years of membership.');
  }

  // Add proficiency criteria
  overallMissingCriteria = [...overallMissingCriteria, ...missingProficiencyCriteria];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Eligibility Checker for President Badge
      </Typography>

      {overallMissingCriteria.length === 0 ? (
        <Typography variant="body2" color="success.main">
          Congratulations! You meet all the requirements for the President Badge.
        </Typography>
      ) : (
        <Paper sx={{ padding: 2 }}>
          {overallMissingCriteria.map((criterion, index) => {
            const isFulfilled = !missingRequiredBadges.includes(criterion);
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  color: isFulfilled ? 'text.secondary' : 'error.main',
                  fontWeight: isFulfilled ? 'normal' : 'bold',
                  textDecoration: isFulfilled ? 'line-through' : 'none',
                }}
              >
                {criterion}
              </Typography>
            );
          })}
        </Paper>
      )}
    </Box>
  );
};

export default EligibilityChecker;
