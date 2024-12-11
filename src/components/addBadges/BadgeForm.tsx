import React from "react";
import { TextField } from "@mui/material";

interface Props {
  badgeName: string;
  setBadgeName: (value: string) => void;
  badgeDescription: string;
  setBadgeDescription: (value: string) => void;
}

const BadgeForm: React.FC<Props> = ({
  badgeName,
  setBadgeName,
  badgeDescription,
  setBadgeDescription,
}) => {
  return (
    <>
      <TextField
        label="Badge Name"
        variant="outlined"
        fullWidth
        value={badgeName}
        onChange={(e) => setBadgeName(e.target.value)}
        sx={{
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      <TextField
        label="Badge Description"
        variant="outlined"
        fullWidth
        multiline
        rows={3}
        value={badgeDescription}
        onChange={(e) => setBadgeDescription(e.target.value)}
        sx={{
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />
    </>
  );
};

export default BadgeForm;
