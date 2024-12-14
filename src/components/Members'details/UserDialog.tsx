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
  roles: string;
  dob: string;
  profileImageUrl?: string;
  badges?: Badge[];
};

interface UserDialogProps {
  user: User | null;
  onClose: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ user, onClose }) => {
  if (!user) return null; // Early return if no user is passed

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <img
              alt={user.name}
              src={`/public/${user.name
                .replace(/\s+/g, "-")
                .toLowerCase()}.jpg`}
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                marginRight: 16,
                objectFit: "cover", // This prevents stretching
                objectPosition: "center", // Ensures the image is centered
              }}
            />
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Rank: {user.rank} | Role: {user.roles}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Date of Birth: {user.dob}
              </Typography>
            </Box>
          </Box>

          <Typography variant="h6" >
            Badges
          </Typography>
          {user.badges && user.badges.length > 0 ? (
            <List>
              {user.badges.map((badge, index) => (
                <ListItem key={index} sx={{ py: 1,paddingLeft:"5px"  }}>
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
          `/public/${badge.name.trim().replace(/\s+/g, "-").toLowerCase()}.png`
        }
        alt={badge.name}
        style={{
          marginTop:"5px",
          
          width: "90%", // Scales the image to fit within the red circle
          height: "90%",
          objectFit: "contain",
          objectPosition: "center",
          zIndex: 1, // Places the image above the red circle
        }}
      />
    </div>                  <ListItemText
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
