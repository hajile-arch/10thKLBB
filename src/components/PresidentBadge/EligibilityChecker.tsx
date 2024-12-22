import React, { useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Divider,
  Stack,

} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EligibilitySummary from "./EligibilitySummary"; // Import the new component

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
    const badgeExists = userBadges.some((b) => {
      const badgeNameWithLevel = `${b.name.trim()} ${
        b.level?.trim() || ""
      }`.toLowerCase();
      const requiredBadgeWithLevel = badge.toLowerCase();
      return (
        badgeNameWithLevel === requiredBadgeWithLevel ||
        (b.level === undefined &&
          b.name.trim().toLowerCase() === requiredBadgeWithLevel)
      );
    });
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

const getUniqueProficiencyBadges = (
  user: User
): Record<string, Set<string>> => {
  const proficiencyBadges = (user.badges || []).filter(
    (badge) =>
      badge.category === "proficiencyAwards" &&
      !requiredBadges.includes(
        `${badge.name.trim()} ${badge.level?.trim() || ""}`
      ) &&
      badge.subCategory !== "compulsory"
  );

  const badgeMap: Record<string, Set<string>> = {};
  proficiencyBadges.forEach((badge) => {
    const group = badge.subCategory || "Uncategorized";
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
      badge.category === "proficiencyAwards" &&
      badge.level?.toLowerCase() === "advanced" &&
      badge.subCategory?.toLowerCase() !== "compulsory" && // Exclude compulsory subcategory
      !requiredBadges.includes(
        `${badge.name.trim()} ${badge.level?.trim() || ""}`
      )
  );

  const uniqueAdvancedBadges = new Set(
    proficiencyBadges.map((badge) => badge.name.trim())
  );
  return uniqueAdvancedBadges.size;
};


const checkEligibilityForProficiency = (user: User): string[] => {
  const proficiencyBadgesByGroup = getUniqueProficiencyBadges(user);
  const totalBadges = Object.values(proficiencyBadgesByGroup).reduce(
    (sum, badges) => sum + badges.size,
    0
  );
  const advancedBadgeCount = countAdvancedBadges(user);

  let missingCriteria: string[] = [];

  if (totalBadges < 6) {
    missingCriteria.push("You need at least 6 unique proficiency badges.");
  }

  if (advancedBadgeCount < 4) {
    missingCriteria.push("You need at least 4 advanced proficiency badges.");
  }

  const expectedGroups = ["groupA", "groupB", "groupC", "groupD"];
  expectedGroups.forEach((group) => {
    console.log("Proficiency Badges By Group:", proficiencyBadgesByGroup);
console.log("Missing Criteria:", missingCriteria);

    if (!proficiencyBadgesByGroup[group] || proficiencyBadgesByGroup[group].size === 0) {
      const groupName = group.charAt(group.length - 1).toUpperCase(); // Extracts "A", "B", etc.
      missingCriteria.push(`You need at least one badge from Group ${groupName}.`);
    }
  });

  return missingCriteria;
};


const checkIfPresidentBadgeExists = (user: User): boolean => {
  return (
    user.badges?.some(
      (badge) => badge.name.toLowerCase() === "president's badge"
    ) || false
  );
};

const EligibilityChecker: React.FC<{ user: User }> = ({ user }) => {
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  
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
  const criteria = React.useMemo(() => {
    return [
      {
        text: "At least 3 years of membership.",
        fulfilled: isMembershipSufficient,
      },
      ...requiredBadges.map((badge) => ({
        text: `Possess the badge: ${badge}.`,
        fulfilled: !missingRequiredBadges.includes(badge),
      })),
      {
        text: "At least 6 unique proficiency badges.",
        fulfilled: totalProficiencyBadges >= 6,
      },
      {
        text: "At least 4 advanced proficiency badges.",
        fulfilled: totalAdvancedBadges >= 4,
      },
      ...proficiencyCriteria
        .filter((criterion) => criterion.startsWith("You need at least one badge from"))
        .map((criterion) => ({
          text: criterion,
          fulfilled: false,
        })),
    ];
  }, [user]);
  
  // Split fulfilled and unfulfilled criteria for better grouping
  const fulfilledCriteria = criteria.filter((criterion) => criterion.fulfilled);
  const unfulfilledCriteria = criteria.filter(
    (criterion) => !criterion.fulfilled
  );
  const progressPercentage = (fulfilledCriteria.length / criteria.length) * 100;

  const handleProgressClick = () => {
    if (progressPercentage === 100) {
      setIsSummaryVisible(true);
    }
  };

  if (isSummaryVisible) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" gutterBottom>
          Eligibility Summary
        </Typography>
        <EligibilitySummary isPresidentBadge={isPresidentBadge} />
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

      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Eligibility Progress
        </Typography>
        <Box
          sx={{
            position: 'relative',
            height: '30px',
            backgroundColor: '#f5f5f5',
            borderRadius: '15px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: progressPercentage === 100 ? '#4caf50' : 'linear-gradient(to right, #4caf50, #81c784)',
              borderRadius: 'inherit',
              transition: 'width 0.4s ease-in-out',
              cursor: progressPercentage === 100 ? 'pointer' : 'default',
            }}
            onClick={handleProgressClick}
          />
          <Typography
            variant="body2"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: progressPercentage < 50 ? '#000000' : '#ffffff',
              fontWeight: progressPercentage === 100 ? 'bold' : 'normal',
              fontSize: '14px',
              cursor: progressPercentage === 100 ? 'pointer' : 'default',
            }}
            onClick={handleProgressClick}
          >
            {`${Math.round(progressPercentage)}%`}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>
          Unfulfilled Criteria
        </Typography>
        <Stack spacing={1}>
          {unfulfilledCriteria.map((criterion, index) => (
            <Box key={index} display="flex" alignItems="center">
              <CancelIcon sx={{ color: "error.main", marginRight: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  color: "error.main",
                  fontWeight: "bold",
                  textDecoration: "none",
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
              <CheckCircleIcon sx={{ color: "success.main", marginRight: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: "normal",
                  textDecoration: "line-through",
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