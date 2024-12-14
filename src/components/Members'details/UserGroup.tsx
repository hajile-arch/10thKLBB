import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import UserCard from "./UserCard"; // Adjust the path based on your folder structure

type User = {
  id: string;
  rank: string;
  name: string;
  profileImageUrl?: string;
};

type UserGroupProps = {
  rank: string;
  users: User[];
  onSelect: (user: User) => void;
};

const rankAbbreviations: Record<string, string> = {
  Recruit: "RCT",
  Private: "PVT",
  "Lance Corporal": "LCPL",
  Corporal: "CPL",
  Sergeant: "SGT",
};

const UserGroup: React.FC<UserGroupProps> = ({ rank, users, onSelect }) => (
  <Box key={rank} sx={{ mb: 4 }}>
    {users.length > 0 && (
      <>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {rankAbbreviations[rank]} - {rank}
        </Typography>
        <Grid container spacing={4}>
          {users.map((user) => (
            <UserCard key={user.id} user={user} onSelect={() => onSelect(user)} />
          ))}
        </Grid>
      </>
    )}
  </Box>
);

export default UserGroup;
