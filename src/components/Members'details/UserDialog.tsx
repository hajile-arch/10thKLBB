import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import EligibilityChecker from "../PresidentBadge/EligibilityChecker.tsx";

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

const UserDialog: React.FC<UserDialogProps> = ({ user, onClose }) => {
  if (!user) return null; // Early return if no user is passed

  const filteredBadges = filterBadges(user.badges);
  const age = calculateAge(user.dob);

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <img
              alt={user.name}
              src={`/images/${user.name
                .trim()
                .replace(/\s+/g, "-")
                .toLowerCase()}.jpg`}
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                marginRight: 16,
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Rank: {user.rank}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Date of Birth: {user.dob} ({age} years old)
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Squad: {user.squad} ({user.platoon})
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Year Joined: {user.yearJoined}
              </Typography>
            </Box>
          </Box>

          {/* Display the EligibilityChecker component */}
          <EligibilityChecker user={user} />

          <Typography variant="h6" mt={3}>
            Badges
          </Typography>

          {filteredBadges.length > 0 ? (
            <List>
              {filteredBadges.map((badge, index) => {
                console.log("Badge Subcategory:", badge.subCategory); // Log badge subCategory here

                return (
                  <ListItem key={index} sx={{ py: 1, paddingLeft: "5px" }}>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 60,
                        height: 60,
                        marginRight: 16,
                      }}
                    >
                      {badge.level?.toLowerCase() === "advanced" && (
                        <div
                          style={{
                            position: "absolute",
                            width: "120%",
                            height: "120%",
                            backgroundColor: "red",
                            borderRadius: "50%",
                            zIndex: 0,
                          }}
                        ></div>
                      )}

                      <img
                        src={
                          badge.iconUrl ||
                          `/images/${badge.name
                            .trim()
                            .replace(/\s+/g, "-")
                            .toLowerCase()}.png`
                        }
                        alt={badge.name}
                        style={{
                          marginTop: "5px",
                          width: "90%",
                          height: "90%",
                          objectFit: "contain",
                          objectPosition: "center",
                          zIndex: 1,
                        }}
                      />
                    </div>
                    <ListItemText
                      primary={
                        ["specialAwards", "serviceAwards"].includes(badge.category.trim().toLowerCase())
                          ? `${badge.name}` // Suppress level for special/service awards
                          : `${badge.name}${badge.level ? ` (${badge.level})` : ""}`
                      }
                      
                      secondary={`Category: ${badge.category}, Subcategory: ${badge.subCategory}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No badges selected.
            </Typography>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
