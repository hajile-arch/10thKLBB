import React, { useState, useEffect } from "react";
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

const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  const imageName = user.name.replace(/\s+/g, "-").toLowerCase();

  const [bgImage, setBgImage] = useState(`/images/pfp/${imageName}.jpg`);

  useEffect(() => {
    const img = new Image();
    img.src = `/images/pfp/${imageName}.jpg`;

    img.onload = () => {
      setBgImage(`/images/pfp/${imageName}.jpg`);
    };

    img.onerror = () => {
      setBgImage(`/images/pfp/default.jpg`);
    };
  }, [imageName]);

  return (
    <Grid item xs={6} sm={6} md={4} lg={3}>
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          height: { xs: 180, sm: 220, md: 260, lg: 300 },
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
            backgroundImage: `url(${bgImage})`,
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
            px: { xs: 1, md: 2 },
            py: { xs: 1, md: 2 },
            // background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* <Typography
            variant="h5"
            sx={{
              fontFamily: '"Bebas Neue", sans-serif',
              textTransform: "uppercase",
              color: "white",
              fontSize: { xs: "1.1rem", md: "1.5rem" },
            }}
          >
            {rankAbbreviations[user.rank] ?? user.rank}
          </Typography> */}

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontFamily: '"roboto", serif',
              textTransform: "uppercase",
              color: "white",
              fontSize: { xs: "0.75rem", md: "0.9rem" },
              // 1. Add a transition so the size change is smooth
              transition:
                "font-size 0.3s ease-in-out, transform 0.3s ease-in-out",

              // 2. Target the parent Paper's hover state
              ".MuiPaper-root:hover &": {
                fontSize: { xs: "0.6rem", md: "0.75rem" }, // Smaller size on hover
                // Optional: Add a slight transform if you want it to shrink physically
                // transform: "scale(0.9)",
              },
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
