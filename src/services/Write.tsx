import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import { uploadToFirebase } from "../firebase/firebaseUtils";

const Write = () => {
  const [category, setCategory] = useState("proficiencyAwards");
  const [subcategory, setSubcategory] = useState("compulsory");
  const [level, setLevel] = useState("basic");
  const [badgeName, setBadgeName] = useState("");
  const [badgeDescription, setBadgeDescription] = useState("");

  // Handle saving the badge to Firebase
  const saveData = async () => {
    if (!badgeName || !badgeDescription) {
      alert("Please provide both badge name and description.");
      return;
    }

    // Build the correct path based on the selected category and subcategory
    let path = `badges/${category}`;
    if (category === "proficiencyAwards") {
      path += `/${subcategory}/${level}`;
    }

    const badgeData = {
      name: badgeName,
      description: badgeDescription,
    };

    const result = await uploadToFirebase(path, badgeData);

    if (result.success) {
      alert("Badge uploaded successfully!");
      setBadgeName(""); // Clear inputs
      setBadgeDescription("");
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  return (
    <>
    <div className="flex items-center justify-center  bg-gray-50">
    <Paper elevation={5} sx={{ padding: 4, maxWidth: 500, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
          Add Badge
        </Typography>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
          noValidate
          autoComplete="off"
        >
          {/* Select Category */}
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

          {/* Subcategory and Level (only for Proficiency Awards) */}
          {category === "proficiencyAwards" && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="subcategory-label">Subcategory</InputLabel>
                    <Select
                      labelId="subcategory-label"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      sx={{
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
            </>
          )}

          {/* Badge Name */}
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

          {/* Badge Description */}
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

          {/* Save Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={saveData}
            sx={{
              alignSelf: "center",
              paddingX: 5,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#0069d9",
              },
            }}
          >
            Save Badge
          </Button>
        </Box>
      </Paper>
    </div>
    </>
  );
};

export default Write;
