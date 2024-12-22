import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";

// Import or define rankAbbreviations if it's not globally accessible
const rankAbbreviations: Record<string, string> = {
  Recruit: "RCT",
  Private: "PVT",
  "Lance Corporal": "LCPL",
  Corporal: "CPL",
  Sergeant: "SGT",
};

type User = {
  id: string;
  name: string;
  rank: string;
  profileImageUrl?: string;
};

interface UserCardProps {
  user: User;
  onSelect: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        height: 300,
        cursor: "pointer",
        overflow: "hidden",
        transition: "transform 0.3s ease-in-out", // Smooth zoom transition
      }}
      onClick={onSelect}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          filter: "brightness(0.75)",
          height: "100%",
          backgroundImage: `url(../images/${user.name.replace(/\s+/g, '-').toLowerCase()}.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "transform 0.3s ease-in-out", // Smooth zoom transition
          transform: "scale(1)", // Default scale
          "&:hover": {
            transform: "scale(1.1)", // Zoom in when hovering
            filter: "brightness(1)",

            
          },
        }}
      />
      {/* Text Overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          color: "white",
          textAlign: "left",
          py: 2,
          px: 2,
          background: "rgba(0, 0, 0, 0.5)",
          
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Bebas Neue", sans-serif',
            textTransform: "uppercase",
          }}
        >
          {rankAbbreviations[user.rank] || user.rank}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "500",
            fontFamily: "Montserrat, Bebas Neue",
            textTransform: "uppercase",
          }}
        >
          {user.name}
        </Typography>
      </Box>
    </Paper>
  </Grid>
);

export default UserCard;
