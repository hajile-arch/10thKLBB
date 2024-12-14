import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { uploadToFirebase } from "../firebase/firebaseUtils";

const BadgeForm = () => {
  const [category, setCategory] = useState<string>("proficiencyAwards");
  const [subCategory, setSubCategory] = useState<string>("compulsory");
  const [name, setName] = useState<string>("");
  const [basicDescription, setBasicDescription] = useState<string>("");
  const [advancedDescription, setAdvancedDescription] = useState<string>("");
  const [description, setDescription] = useState<string>(""); // For non-proficiency awards
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Badge Name is required!");
      return;
    }

    if (
      category === "proficiencyAwards" &&
      (!basicDescription.trim() || !advancedDescription.trim())
    ) {
      alert("Both Basic and Advanced descriptions are required for Proficiency Awards!");
      return;
    }

    if (
      (category === "specialAwards" || category === "serviceAwards") &&
      !description.trim()
    ) {
      alert("Description is required for Special and Service Awards!");
      return;
    }

    const path = `badges/${category}/${subCategory || ""}`;
    const data: Record<string, any> = {
      name,
    };

    if (category === "proficiencyAwards") {
      data.description = {
        Basic: basicDescription,
        Advanced: advancedDescription,
      };
    } else {
      data.description = description;
    }

    try {
      const result = await uploadToFirebase(path, data);
      if (result.success) {
        alert("Badge saved successfully!");
        setName("");
        setBasicDescription("");
        setAdvancedDescription("");
        setDescription("");
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error uploading badge:", error);
      alert("An error occurred while saving the badge.");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 2, p: 2, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h5" mb={2} align="center">
        Add Badge
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="proficiencyAwards">Proficiency Awards</MenuItem>
          <MenuItem value="serviceAwards">Service Awards</MenuItem>
          <MenuItem value="specialAwards">Special Awards</MenuItem>
        </Select>
      </FormControl>

      {category === "proficiencyAwards" && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Sub-Category</InputLabel>
          <Select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
            <MenuItem value="compulsory">Compulsory</MenuItem>
            <MenuItem value="groupA">Group A</MenuItem>
            <MenuItem value="groupB">Group B</MenuItem>
            <MenuItem value="groupC">Group C</MenuItem>
            <MenuItem value="groupD">Group D</MenuItem>
          </Select>
        </FormControl>
      )}

      <TextField
        fullWidth
        label="Badge Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />

      {category === "proficiencyAwards" ? (
        <>
          <TextField
            fullWidth
            label="Basic Level Description"
            multiline
            rows={3}
            value={basicDescription}
            onChange={(e) => setBasicDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Advanced Level Description"
            multiline
            rows={3}
            value={advancedDescription}
            onChange={(e) => setAdvancedDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
        </>
      ) : (
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
        sx={{ py: 1.5 }}
      >
        Save Badge
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        onClick={() => navigate("/read")}
        fullWidth
        sx={{ py: 1.5 }}
      >
        Go to Read
      </Button>
    </Box>
  );
};

export default BadgeForm;
