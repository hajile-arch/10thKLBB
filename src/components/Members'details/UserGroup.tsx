import React from "react";
import { Box, Grid } from "@mui/material";
import UserCard from "./UserCard"; // Adjust the path based on your folder structure

type User = {
  badges: never[];
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

// const rankAbbreviations: Record<string, string> = {
//   Recruit: "RCT",
//   Private: "PVT",
//   "Lance Corporal": "LCPL",
//   Corporal: "CPL",
//   Sergeant: "SGT",
// };

const UserGroup: React.FC<UserGroupProps> = ({ rank, users, onSelect }) => (
  <Box key={rank} sx={{ mb: 4 }}>
    {users.length > 0 && (
      <>
        {/* Active Status section with a green dot */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Green dot */}
          {/* <Box
            sx={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              
            }}
          /> */}
          {/* <Typography variant="h8" sx={{ color: '#4caf50', fontWeight: 400 }}>
            Status: Active
          </Typography> */}
        </Box>

        {/* Displaying user cards */}
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
