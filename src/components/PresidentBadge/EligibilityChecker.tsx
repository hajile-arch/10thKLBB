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

import { Member, SelectedBadge, NCO_RANKS, SENIOR_SECTION_AGE } from "../../enum";

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

// Ages and years use the year only (birthdays are ignored on purpose)
const getBirthYear = (member: Member): number | null => {
  const year = member.dob ? parseInt(member.dob.slice(0, 4), 10) : NaN;
  return isNaN(year) ? null : year;
};

const getYearJoined = (member: Member): number | null => {
  if (member.yearJoined) return member.yearJoined;
  const match = member.yearJoinedBB?.match(/\b(\d{4})\b/);
  return match ? parseInt(match[1], 10) : null;
};

// Years in the Senior Section: counted from the later of the year they joined
// BB and the year they turned 13 (when members move up from the Junior Section)
const getSeniorYears = (member: Member): number | null => {
  const joined = getYearJoined(member);
  const birthYear = getBirthYear(member);
  if (joined === null || birthYear === null) return null;
  const seniorStart = Math.max(joined, birthYear + SENIOR_SECTION_AGE);
  return new Date().getFullYear() - seniorStart;
};

const checkMembershipDuration = (member: Member): boolean => {
  const years = getSeniorYears(member);
  return years !== null && years >= 3;
};

const checkAge = (member: Member): boolean => {
  const birthYear = getBirthYear(member);
  if (birthYear === null) return false;
  const age = new Date().getFullYear() - birthYear;
  return age >= 15 && age <= 20;
};

const checkIsNco = (member: Member): boolean => NCO_RANKS.includes(member.rank);

const getProficiencyBadgesByGroup = (
  badges: SelectedBadge[]
): Record<string, Set<string>> => {
  const result: Record<string, Set<string>> = {};

  badges
    .filter(
      (b) =>
        b.category === "proficiencyAwards" &&
        b.subCategory !== "compulsory" &&
        b.name
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
  return badges.some(
    (b) => b.name?.trim().toLowerCase() === badgeName.toLowerCase()
  );
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

  const badges = memberBadges || [];

  const missingRequiredBadges = checkRequiredBadges(badges, REQUIRED_BADGES);
  const isMembershipSufficient = checkMembershipDuration(member);
  const isAgeEligible = checkAge(member);
  const isNco = checkIsNco(member);
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
      { text: "Aged 15 to 20 this year.", fulfilled: isAgeEligible },
      { text: "Holds an NCO rank (Lance Corporal or above).", fulfilled: isNco },
      { text: "At least 3 years of service in the Senior Section.", fulfilled: isMembershipSufficient },
      ...REQUIRED_BADGES.map((badge) => ({
        text: `Possess the badge: ${badge}.`,
        fulfilled: !missingRequiredBadges.includes(badge),
      })),
      { text: "At least 6 unique proficiency badges.", fulfilled: totalProficiencyBadges >= 6 },
      { text: "At least 4 advanced proficiency badges.", fulfilled: totalAdvancedBadges >= 4 },
    ];

    const groupCriteria = PROFICIENCY_GROUPS.map((group) => ({
      text: `You need at least one badge from Group ${group.replace("group", "").toUpperCase()}.`,
      fulfilled: Boolean(proficiencyBadgesByGroup[group]?.size),
    }));

    return [...base, ...groupCriteria];
  }, [
    isAgeEligible,
    isNco,
    isMembershipSufficient,
    missingRequiredBadges,
    totalProficiencyBadges,
    totalAdvancedBadges,
    proficiencyBadgesByGroup,
  ]);

  const fulfilledCriteria = criteria.filter((c) => c.fulfilled);
  const unfulfilledCriteria = criteria.filter((c) => !c.fulfilled);
  const progressPercentage = (fulfilledCriteria.length / criteria.length) * 100;
  const [isFounderSummaryVisible, setIsFounderSummaryVisible] = useState(false);

  const handleProgressClick = () => {
    if (progressPercentage === 100) setIsSummaryVisible(true);
  };

  const pulseStyle =
    progressPercentage === 100
      ? { animation: "pulse-glow 1.5s ease-in-out infinite" }
      : {};

  if (isSummaryVisible) {
    return (
      <EligibilitySummary
        isFounderBadge={isFounderBadge}
        isPresidentBadge={isPresidentBadge}
      />
    );
  }
if (isPresidentBadge) {
  return (
    <Box sx={{ padding: 3, borderLeft: "4px solid #FFD700", marginLeft: 1, marginBottom: 2 }}>
      <Typography variant="overline" color="text.secondary">Next Achievement</Typography>
      <Typography variant="h5" fontWeight="bold">Founder's Badge</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
        You've earned your place. The next step is a conversation —
        meet <strong>Inst Elijah</strong> to find out what's next.
      </Typography>
    </Box>
  );
}

  return (
    <Box sx={{ padding: 2 }}>
      <style>{`
        @keyframes pulse-glow {
          0%   { box-shadow: 0 0 6px 2px rgba(76, 175, 80, 0.4); }
          50%  { box-shadow: 0 0 18px 6px rgba(76, 175, 80, 0.85); }
          100% { box-shadow: 0 0 6px 2px rgba(76, 175, 80, 0.4); }
        }
      `}</style>

      <Typography variant="h5" gutterBottom>
        Eligibility Checker for President&apos;s Badge
      </Typography>

      <Box sx={{ marginBottom: 2 }}>
        <Typography>
          Total Proficiency Badges: <strong>{totalProficiencyBadges}</strong>
        </Typography>
        <Typography>
          Total Advanced Badges: <strong>{totalAdvancedBadges}</strong>
        </Typography>
        <Divider sx={{ marginY: 1 }} />
      </Box>

      <Box sx={{ marginBottom: 3 }}>
        <Typography fontWeight="bold" marginBottom={1}>
          Progress Bar
        </Typography>
        <Box
          sx={{
            position: "relative",
            height: 30,
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            // overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${progressPercentage}%`,
              height: "100%",
              background:
                progressPercentage === 100
                  ? "#4caf50"
                  : "linear-gradient(to right, #4caf50, #81c784)",
              transition: "width 0.4s ease-in-out",
              cursor: progressPercentage === 100 ? "pointer" : "default",
              borderRadius: 15,
              ...pulseStyle,
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
              pointerEvents: "none",
            }}
          >
            {Math.round(progressPercentage)}%
          </Typography>
        </Box>
      </Box>

      {unfulfilledCriteria.length > 0 && (
        <Paper sx={{ padding: 2, marginBottom: 2 }}>
          <Typography variant="h6" gutterBottom>
            Unfulfilled Criteria
          </Typography>
          <Stack spacing={1}>
            {unfulfilledCriteria.map((criterion, index) => (
              <Box key={index} display="flex" alignItems="center">
                <CancelIcon sx={{ color: "error.main", marginRight: 1 }} />
                <Typography color="error">{criterion.text}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Fulfilled Criteria
        </Typography>
        <Stack spacing={1}>
          {fulfilledCriteria.map((criterion, index) => (
            <Box key={index} display="flex" alignItems="center">
              <CheckCircleIcon sx={{ color: "success.main", marginRight: 1 }} />
              <Typography sx={{ textDecoration: "line-through" }}>
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