import React from "react";
import { Box, Grid } from "@mui/material";
import UserCard from "./UserCard";
import { Member } from "../../enum";

interface UserGroupProps {
  rank: string;
  users: Member[];
  onSelect: (user: Member) => void;
}

const UserGroup: React.FC<UserGroupProps> = ({
  rank,
  users,
  onSelect,
}) => {
  if (users.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={4}>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onSelect={() => onSelect(user)}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default UserGroup;
