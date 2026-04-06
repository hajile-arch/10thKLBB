import React, { useMemo, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import EligibilitySummary from "./EligibilitySummary";

import { Member, SelectedBadge } from "../../enum";

// =====================
// CONSTANTS
// =====================

const REQUIRED_BADGES: string[] = [
  "Target Badge Basic",
  "Drill Advanced",
  "Recruitment Basic",
  "Christian Education Advanced",
  "NCO Proficiency Star",
];

const PROFICIENCY_GROUPS = ["groupA", "groupB", "groupC", "groupD"];

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Safely checks for missing required badges.
 */
const checkRequiredBadges = (
  badges: SelectedBadge[],
  requiredBadges: string[]
): string[] => {
  const missing: string[] = [];

  requiredBadges.forEach((required) => {
    const exists = badges.some((b) => {
      if (!b?.name) return false;
      const name = b.name?.trim().toLowerCase() || "";
      const level = b.level?.trim().toLowerCase() || "";
      const badgeFullName = `${name} ${level}`.trim();
      return badgeFullName === required.toLowerCase();
    });

    if (!exists) missing.push(required);
  });

  return missing;
};

const checkMembershipDuration = (member: Member): boolean => {
  if (!member.yearJoined) return false;
  const currentYear = new Date().getFullYear();
  return currentYear - member.yearJoined >= 3;
};

const getProficiencyBadgesByGroup = (
  badges: SelectedBadge[]
): Record<string, Set<string>> => {
  const result: Record<string, Set<string>> = {};

  badges
    .filter(
      (b) =>
        b.category === "proficiencyAwards" &&
        b.subCategory !== "compulsory" &&
        b.name // ignore invalid badges
    )
    .forEach((b) => {
      const group = b.subCategory || "Uncategorized";
      if (!result[group]) result[group] = new Set();
      result[group].add(b.name.trim());
    });

  return result;
};

const countAdvancedBadges = (badges: SelectedBadge[]): number => {
  return new Set(
    badges
      .filter((b) => b.level === "Advanced" && b.subCategory !== "compulsory")
      .map((b) => b.name.trim())
  ).size;
};

const hasBadge = (badges: SelectedBadge[], badgeName: string): boolean => {
  return badges.some((b) => b.name?.trim().toLowerCase() === badgeName.toLowerCase());
};

// =====================
// COMPONENT
// =====================

interface Props {
  member: Member;
  memberBadges: SelectedBadge[];
}

const EligibilityChecker: React.FC<Props> = ({ member, memberBadges }) => {
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  // Safely default to empty array
  const badges = memberBadges || [];

  const missingRequiredBadges = checkRequiredBadges(badges, REQUIRED_BADGES);
  const isMembershipSufficient = checkMembershipDuration(member);
  const proficiencyBadgesByGroup = getProficiencyBadgesByGroup(badges);

  const totalProficiencyBadges = Object.values(proficiencyBadgesByGroup).reduce(
    (sum, set) => sum + set.size,
    0
  );

  const totalAdvancedBadges = countAdvancedBadges(badges);

  const isPresidentBadge = hasBadge(badges, "President's Badge");
  const isFounderBadge = hasBadge(badges, "Founder's Badge");

  const criteria = useMemo(() => {
    const base = [
      { text: "At least 3 years of membership.", fulfilled: isMembershipSufficient },
      ...REQUIRED_BADGES.map((badge) => ({
        text: `Possess the badge: ${badge}.`,
        fulfilled: !missingRequiredBadges.includes(badge),
      })),
      { text: "At least 6 unique proficiency badges.", fulfilled: totalProficiencyBadges >= 6 },
      { text: "At least 4 advanced proficiency badges.", fulfilled: totalAdvancedBadges >= 4 },
    ];

    const groupCriteria = PROFICIENCY_GROUPS.map((group) => ({
      text: `You need at least one badge from Group ${group.toUpperCase()}.`,
      fulfilled: Boolean(proficiencyBadgesByGroup[group]?.size),
    }));

    return [...base, ...groupCriteria];
  }, [isMembershipSufficient, missingRequiredBadges, totalProficiencyBadges, totalAdvancedBadges, proficiencyBadgesByGroup]);

  const fulfilledCriteria = criteria.filter((c) => c.fulfilled);
  const unfulfilledCriteria = criteria.filter((c) => !c.fulfilled);
  const progressPercentage = (fulfilledCriteria.length / criteria.length) * 100;

  const handleProgressClick = () => {
    if (progressPercentage === 100) setIsSummaryVisible(true);
  };

  if (isSummaryVisible) {
    return <EligibilitySummary isFounderBadge={isFounderBadge} isPresidentBadge={isPresidentBadge} />;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Eligibility Checker for President&apos;s Badge
      </Typography>

      <Box sx={{ marginBottom: 2 }}>
        <Typography>Total Proficiency Badges: <strong>{totalProficiencyBadges}</strong></Typography>
        <Typography>Total Advanced Badges: <strong>{totalAdvancedBadges}</strong></Typography>
        <Divider sx={{ marginY: 1 }} />
      </Box>

      <Box sx={{ marginBottom: 3 }}>
        <Typography fontWeight="bold" marginBottom={1}>Eligibility Progress</Typography>
        <Box sx={{ position: "relative", height: 30, backgroundColor: "#f5f5f5", borderRadius: 15, overflow: "hidden" }}>
          <Box
            sx={{
              width: `${progressPercentage}%`,
              height: "100%",
              background: progressPercentage === 100 ? "#4caf50" : "linear-gradient(to right, #4caf50, #81c784)",
              transition: "width 0.4s ease-in-out",
              cursor: progressPercentage === 100 ? "pointer" : "default",
            }}
            onClick={handleProgressClick}
          />
          <Typography
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: progressPercentage < 50 ? "#000" : "#fff",
              fontWeight: progressPercentage === 100 ? "bold" : "normal",
            }}
            onClick={handleProgressClick}
          >
            {Math.round(progressPercentage)}%
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>Unfulfilled Criteria</Typography>
        <Stack spacing={1}>
          {unfulfilledCriteria.map((criterion, index) => (
            <Box key={index} display="flex" alignItems="center">
              <CancelIcon sx={{ color: "error.main", marginRight: 1 }} />
              <Typography color="error">{criterion.text}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>Fulfilled Criteria</Typography>
        <Stack spacing={1}>
          {fulfilledCriteria.map((criterion, index) => (
            <Box key={index} display="flex" alignItems="center">
              <CheckCircleIcon sx={{ color: "success.main", marginRight: 1 }} />
              <Typography sx={{ textDecoration: "line-through" }}>{criterion.text}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default EligibilityChecker;
