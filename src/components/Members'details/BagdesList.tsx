import React from "react";
import { List, ListItem, ListItemText, Typography } from "@mui/material";

type Badge = {
  iconUrl?: string;
  name: string;
  level?: string;
  category: string;
  subCategory: string;
  description?: string; // Add description to Badge type
};

interface BadgesListProps {
  badges: Badge[];
}

const formatCategory = (category: string): string =>
  category.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b[a-z]/g, (char) => char.toUpperCase());

const formatSubCategory = (badge: Badge): string => {
  if (badge.category === "specialAwards" || badge.category === "serviceAwards" ) {
    return badge.description || "No description available"; // Show description if category is special or service award
  }

  if (!badge.subCategory) return "Unspecified"; // Handle missing subcategories
  const formatted = badge.subCategory
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add spaces for camelCase
    .replace("group", "Group") // Replace "group" with "Group"
    .trim();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1); // Capitalize the first letter
};

const BadgesList: React.FC<BadgesListProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No badges available.
      </Typography>
    );
  }

  return (
    <List>
      {badges.map((badge, index) => (
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
                `/images/${badge.name.trim().replace(/\s+/g, "-").toLowerCase()}.png`
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
                  <strong>Description:</strong> {formatSubCategory(badge)}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default BadgesList;
