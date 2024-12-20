import React from "react";
import { List, ListItem, ListItemText, Typography } from "@mui/material";

type Badge = {
  iconUrl?: string;
  name: string;
  level?: string;
  category: string;
  subCategory: string;
  description?: string;
};

interface BadgesListProps {
  badges: Badge[];
}

/** Formats category by adding spaces and capitalizing */
const formatCategory = (category: string): string =>
  category.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b[a-z]/g, (char) => char.toUpperCase());

/** Returns badge details based on its category */2
const getBadgeDetails = (badge: Badge): string => {
  if (badge.category === "specialAwards" || badge.category === "serviceAwards") {
    return badge.description || "No description available";
  }

  if (badge.category === "proficiencyAwards") {
    if (typeof badge.description === "object" && badge.level) {
      // Extract the description based on the level
      const levelDescription = badge.description[badge.level];
      if (levelDescription) {
        return `${levelDescription} `;
      }
    }
    return badge.level ? `Level: ${badge.level}` : "No description or level specified";
  }

  return badge.subCategory
    ? badge.subCategory.replace(/([a-z])([A-Z])/g, "$1 $2").replace("group", "Group").trim()
    : "Unspecified";
};


/** BadgeItem Component - Renders individual badge details */
const BadgeItem: React.FC<{ badge: Badge }> = ({ badge }) => (
  <ListItem sx={{ py: 1, paddingLeft: "5px" }}>
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
          `/images/badges/${badge.name.trim().replace(/\s+/g, "-").toLowerCase()}.png`
        }
        alt={badge.name}
        style={{
          width: "90%",
          height: "90%",
          objectFit: "contain",
          objectPosition: "center",
          zIndex: 1,
        }}
      />
    </div>
    <ListItemText
      primary={badge.name.replace("(Basic)", "")}
      secondary={
        <>
          <Typography variant="body2" color="textSecondary">
            <strong>Category:</strong> {formatCategory(badge.category)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Details:</strong> {getBadgeDetails(badge)}
          </Typography>
        </>
      }
    />
  </ListItem>
);


/** Main BadgesList Component */
const BadgesList: React.FC<BadgesListProps> = ({ badges }) => {
  if (!badges.length) {
    return (
      <Typography variant="body2" color="textSecondary">
        No badges available.
      </Typography>
    );
  }

  // Sort badges with custom rules
  const sortedBadges = [...badges].sort((a, b) => {
    // Rule 1: "Target Badge" in "compulsory" comes first
    if (a.subCategory === "compulsory" && a.name === "Target Badge") return -1;
    if (b.subCategory === "compulsory" && b.name === "Target Badge") return 1;

    // Rule 2: In "specialAwards" or "serviceAwards", "Founder" comes first
    if (
      (a.category === "specialAwards" || a.category === "serviceAwards") &&
      a.name === "Founder's Badge"
    )
      return -1;
    if (
      (b.category === "specialAwards" || b.category === "serviceAwards") &&
      b.name === "Founder's Badge"
    )
      return 1;

    // Rule 3: In "specialAwards" or "serviceAwards", "Second President" comes second
    if (
      (a.category === "specialAwards" || a.category === "serviceAwards") &&
      a.name === "President's Badge"
    )
      return -1;
    if (
      (b.category === "specialAwards" || b.category === "serviceAwards") &&
      b.name === "President's Badge"
    )
      return 1;

    // Preserve order for other badges
    return 0;
  });

  return (
    <List>
      {sortedBadges.map((badge, index) => (
        <BadgeItem key={index} badge={badge} />
      ))}
    </List>
  );
};

export default BadgesList;
