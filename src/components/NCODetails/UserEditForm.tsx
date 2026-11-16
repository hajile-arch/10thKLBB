import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

interface Badge {
  badgeKey: string;
  category: string;
  description: string;
  level?: string;
  name: string;
  subCategory?: string;
}

interface User {
    id: string;
    name: string;
    dob: string;
    squad: string;
    yearJoined: string;
    badges: Badge[];
  }
  
interface UserEditFormProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onCancel: () => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSave, onCancel }) => {
  const [editedUser, setEditedUser] = useState(user);

  // Extract badge names for display
  const badgeNames = editedUser.badges.map((badge) => badge.name).join(", ");

  const handleBadgesChange = (badgeInput: string) => {
    const updatedBadges = badgeInput.split(",").map((name) => ({
      badgeKey: name.trim(),
      category: "default",
      description: "",
      name: name.trim(),
    }));
    setEditedUser({ ...editedUser, badges: updatedBadges });
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5">Edit User</Typography>
      <TextField
        label="Name"
        value={editedUser?.name || ""}
        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Date of Birth"
        value={editedUser?.dob || ""}
        onChange={(e) => setEditedUser({ ...editedUser, dob: e.target.value })}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Squad"
        value={editedUser?.squad || ""}
        onChange={(e) => setEditedUser({ ...editedUser, squad: e.target.value })}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Year Joined"
        value={editedUser?.yearJoined || ""}
        onChange={(e) =>
          setEditedUser({ ...editedUser, yearJoined: e.target.value })
        }
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      <TextField
        label="Badges (comma-separated)"
        value={badgeNames}
        onChange={(e) => handleBadgesChange(e.target.value)}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <Box>
        <Button
          variant="contained"
          onClick={() => onSave(editedUser)}
          sx={{ marginRight: 2 }}
        >
          Save
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default UserEditForm;
