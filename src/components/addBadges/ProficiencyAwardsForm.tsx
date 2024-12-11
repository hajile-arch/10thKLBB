import React from "react";
import { Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface Props {
  subcategory: string;
  setSubcategory: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
}

const ProficiencyAwardsForm: React.FC<Props> = ({
  subcategory,
  setSubcategory,
  level,
  setLevel,
}) => {
  return (
    <Grid container spacing={7}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="subcategory-label">Subcategory</InputLabel>
          <Select
            labelId="subcategory-label"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            sx={{
              minWidth: 150,
              borderRadius: "8px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem value="compulsory">Compulsory</MenuItem>
            <MenuItem value="groupA">Group A</MenuItem>
            <MenuItem value="groupB">Group B</MenuItem>
            <MenuItem value="groupC">Group C</MenuItem>
            <MenuItem value="groupD">Group D</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="level-label">Level</InputLabel>
          <Select
            labelId="level-label"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            sx={{
              borderRadius: "8px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem value="basic">Basic</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default ProficiencyAwardsForm;
