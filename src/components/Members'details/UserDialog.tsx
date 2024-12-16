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
  IconButton,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Import check icon

type Badge = {
  iconUrl?: string;
  name: string;
  level?: string;
  category: string;
  subCategory: string;
};

type User = {
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
  onCheckEligibility: () => void; // Added function to handle button click
}

const filterBadges = (badges: Badge[] | undefined): Badge[] => {
  if (!badges) return [];

  // Group badges by name and pick the highest level for each name
  const badgeMap = new Map<string, Badge>();

  badges.forEach((badge) => {
    const existingBadge = badgeMap.get(badge.name);
    if (
      !existingBadge || // Add if no existing badge with the same name
      (badge.level?.toLowerCase() === "advanced" &&
        existingBadge.level?.toLowerCase() !== "advanced") // Replace Basic with Advanced
    ) {
      badgeMap.set(badge.name, badge);
    }
  });

  return Array.from(badgeMap.values());
};

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const currentDate = new Date();
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const month = currentDate.getMonth();
  if (month < birthDate.getMonth() || (month === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const UserDialog: React.FC<UserDialogProps> = ({ user, onClose, onCheckEligibility }) => {
  if (!user) return null; // Early return if no user is passed

  const filteredBadges = filterBadges(user.badges);
  const age = calculateAge(user.dob);

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        User Details
        {/* Added Button for Checking Eligibility */}
        <Tooltip title="Check Eligibility for President Badge">
          <IconButton
            edge="end"
            color="primary"
            onClick={onCheckEligibility}
            style={{ position: "absolute", right: 16, top: 16 }}
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
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
                objectFit: "cover", // Prevent stretching
                objectPosition: "center", // Center the image
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
                {user.squad} ( {user.platoon})
              </Typography>
            </Box>
          </Box>

          <Typography variant="h6">Badges</Typography>
          {filteredBadges.length > 0 ? (
            <List>
              {filteredBadges.map((badge, index) => (
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
                    {/* Red Circle Background for Advanced Level */}
                    {badge.level?.toLowerCase() === "advanced" && (
                      <div
                        style={{
                          position: "absolute",
                          width: "120%",
                          height: "120%",
                          backgroundColor: "red",
                          borderRadius: "50%",
                          zIndex: 0, // Places the red background behind the image
                        }}
                      ></div>
                    )}

                    {/* Badge Image */}
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

                        width: "90%", // Scales the image to fit within the red circle
                        height: "90%",
                        objectFit: "contain",
                        objectPosition: "center",
                        zIndex: 1, // Places the image above the red circle
                      }}
                    />
                  </div>{" "}
                  <ListItemText
                    primary={`${badge.name} (${badge.level || "Basic"})`}
                    secondary={`Category: ${badge.category}, Subcategory: ${badge.subCategory}`}
                  />
                </ListItem>
              ))}
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
