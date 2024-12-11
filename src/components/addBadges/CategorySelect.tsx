import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface Props {
  category: string;
  setCategory: (value: string) => void;
}

const CategorySelect: React.FC<Props> = ({ category, setCategory }) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="category-label">Category</InputLabel>
      <Select
        labelId="category-label"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        sx={{
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      >
        <MenuItem value="proficiencyAwards">Proficiency Awards</MenuItem>
        <MenuItem value="serviceAwards">Service Awards</MenuItem>
        <MenuItem value="specialAwards">Special Awards</MenuItem>
      </Select>
    </FormControl>
  );
};

export default CategorySelect;
