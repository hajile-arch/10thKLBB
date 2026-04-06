import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import { Member, Rank } from "../../enum";

const rankAbbreviations: Record<Rank, string> = {
  Recruit: "RCT",
  Private: "PVT",
  "Lance Corporal": "LCPL",
  Corporal: "CPL",
  Sergeant: "SGT",
};

interface UserCardProps {
  user: Member;
  onSelect: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onSelect,
}) => {
  const imageName = user.name
    .replace(/\s+/g, "-")
    .toLowerCase();

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          height: 300,
          cursor: "pointer",
          overflow: "hidden",
          transition: "transform 0.3s ease-in-out",
        }}
        onClick={onSelect}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(../images/pfp/${imageName}.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.75)",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
              filter: "brightness(1)",
            },
          }}
        />

        {/* Text Overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            px: 2,
            py: 2,
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Bebas Neue", sans-serif',
              textTransform: "uppercase",
              color:"white"
            }}
          >
            {rankAbbreviations[user.rank] ?? user.rank}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              textTransform: "uppercase",
              color:"white"
            }}
          >
            {user.name}
          </Typography>
        </Box>
      </Paper>
    </Grid>
  );
};

export default UserCard;
