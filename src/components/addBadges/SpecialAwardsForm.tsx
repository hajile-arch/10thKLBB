import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface Props {
  specialAward: string;
  setSpecialAward: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  specialAwardsLevels: Record<string, string[] | undefined>;
}

const SpecialAwardsForm: React.FC<Props> = ({
  specialAward,
  setSpecialAward,
  level,
  setLevel,
  specialAwardsLevels,
}) => {
  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="special-award-label">Special Award</InputLabel>
        <Select
          labelId="special-award-label"
          value={specialAward}
          onChange={(e) => {
            setSpecialAward(e.target.value);
            setLevel(""); // Reset level when special award changes
          }}
          sx={{
            borderRadius: "8px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        >
          <MenuItem value="dukeOfEdinburgh">Duke of Edinburgh</MenuItem>
          <MenuItem value="scholastics">Scholastics</MenuItem>
          <MenuItem value="ncoProficiency">NCO Proficiency</MenuItem>
          <MenuItem value="presidentsAward">President’s Award</MenuItem>
          <MenuItem value="foundersAward">Founder’s Award</MenuItem>
        </Select>
      </FormControl>

      {/* Levels are only applicable for certain special awards */}
      {specialAward !== "presidentsAward" &&
        specialAward !== "foundersAward" &&
        specialAwardsLevels[specialAward] && (
          <FormControl fullWidth>
            <InputLabel id="special-level-label">Level</InputLabel>
            <Select
              labelId="special-level-label"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              sx={{
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            >
              {specialAwardsLevels[specialAward]?.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>
                  {lvl}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
    </>
  );
};

export default SpecialAwardsForm;
