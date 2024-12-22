import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Box,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";
import EligibilityChecker from "../PresidentBadge/EligibilityChecker.tsx";
import BadgesList from "./BagdesList.tsx";

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

interface UserDialogProps {
  user: User | null;
  onClose: () => void;
}

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const currentDate = new Date();
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const month = currentDate.getMonth();
  if (
    month < birthDate.getMonth() ||
    (month === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const filterBadges = (badges: Badge[] | undefined): Badge[] => {
  if (!badges) return [];

  const badgeMap = new Map<string, Badge>();

  badges.forEach((badge) => {
    const existingBadge = badgeMap.get(badge.name);
    if (
      !existingBadge ||
      (badge.level?.toLowerCase() === "advanced" &&
        existingBadge.level?.toLowerCase() !== "advanced")
    ) {
      badgeMap.set(badge.name, badge);
    }
  });

  return Array.from(badgeMap.values());
};

const categorizeProficiencyBadges = (badges: Badge[]): { [key: string]: Badge[] } => {
  const categories: { [key: string]: Badge[] } = {
    compulsory: [],
    groupA: [],
    groupB: [],
    groupC: [],
    groupD: [],
    others: [],
  };

  badges.forEach((badge) => {
    const group = badge.subCategory;
    if (categories[group]) {
      categories[group].push(badge);
    } else {
      categories.others.push(badge);
    }
  });

  return categories;
};

const countBadges = (badges: Badge[]): { [name: string]: number } => {
  return badges.reduce((acc, badge) => {
    acc[badge.name] = (acc[badge.name] || 0) + 1;
    return acc;
  }, {} as { [name: string]: number });
};

const UserDialog: React.FC<UserDialogProps> = ({ user, onClose }) => {
  if (!user) return null;

  const filteredBadges = filterBadges(user.badges);
  const proficiency = filteredBadges.filter(
    (badge) => badge.category === "proficiencyAwards"
  );
  const specialService = filteredBadges.filter(
    (badge) =>
      badge.category === "specialAwards" || badge.category === "serviceAwards"
  );

  const proficiencyByCategory = categorizeProficiencyBadges(proficiency);
  const badgeCounts = countBadges(user.badges || []);

  const age = calculateAge(user.dob);

  const capitalizeCategory = (category: string) => {
    return category.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Member's Details</DialogTitle>
      <DialogContent>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              alt={user.name}
              src={`/images/${user.name
                .trim()
                .replace(/\s+/g, "-")
                .toLowerCase()}.jpg`}
              sx={{
                width: 100,
                height: 100,
                marginRight: 2,
                boxShadow: 3,
              }}
            />
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Rank:</strong> {user.rank}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Date of Birth:</strong> {user.dob} ({age} years old)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Squad:</strong> {user.squad} ({user.platoon})
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Year Joined:</strong> {user.yearJoined}
              </Typography>
            </Box>
          </Box>

          {/* Display the EligibilityChecker component */}
          <EligibilityChecker user={user} />

          <Divider sx={{ my: 1 }} />

          <Typography variant="h6" mt={3}>
            Badges
          </Typography>

          {/* Proficiency Awards by Category */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6">Proficiency Awards</Typography>
            {Object.entries(proficiencyByCategory).map(([category, badges]) => {
              return badges.length > 0 ? (
                <Box key={category} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {capitalizeCategory(category)}
                  </Typography>
                  <BadgesList badges={badges} />
                </Box>
              ) : null;
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Special & Service Awards */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Special & Service Awards</Typography>
            {specialService.length > 0 ? (
              <BadgesList
                badges={specialService.map((badge) => ({
                  ...badge,
                  name: badgeCounts[badge.name] > 1
                    ? `${badge.name} (x${badgeCounts[badge.name]})`
                    : badge.name,
                }))}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No special or service awards available.
              </Typography>
            )}
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
