import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
} from "@mui/material";
import {
  getDataFromFirebase,
  deleteDataFromFirebase,
} from "../firebase/firebaseUtils";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

const BadgeList = () => {
  const [badges, setBadges] = useState<any>({});
  const [category, setCategory] = useState<string>("proficiencyAwards");
  const [subFilter, setSubFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const path = `badges/${category}`;
      const result = await getDataFromFirebase(path);

      if (result.success) {
        setBadges(result.data || {});
      } else {
        alert("Error fetching badges.");
      }
    };

    fetchData();
  }, [category]);

  const handleDelete = async (
    badgePath: string,
    subCategory: string,
    badgeKey: string
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this badge?"
    );
    if (!confirmDelete) return;

    const result = await deleteDataFromFirebase(badgePath);
    if (result.success) {
      alert(result.message);

      // Update state to remove the deleted badge
      const updatedBadges = { ...badges };
      delete updatedBadges[subCategory][badgeKey];

      // Remove the subCategory if it's empty
      if (Object.keys(updatedBadges[subCategory] || {}).length === 0) {
        delete updatedBadges[subCategory];
      }

      setBadges(updatedBadges);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const renderBadges = () => {
    const filteredBadges =
      subFilter === "all" || category !== "proficiencyAwards"
        ? badges
        : { [subFilter]: badges[subFilter] };

    return Object.keys(filteredBadges).map((subCategory) => {
      const displaySubCategory =
        (category === "specialAwards" || category === "serviceAwards") &&
        subCategory === "compulsory"
          ? ""
          : subCategory.charAt(0).toUpperCase() + subCategory.slice(1);

      return (
        <Box key={subCategory} sx={{ mb: 4 }}>
          {displaySubCategory && (
            <Typography variant="h6" sx={{ mb: 2 }}>
              {displaySubCategory}
            </Typography>
          )}
          <Grid container spacing={2}>
            {Object.keys(filteredBadges[subCategory] || {}).map((badgeKey) => {
              const badge = filteredBadges[subCategory][badgeKey];
              const badgePath = `badges/${category}/${subCategory}/${badgeKey}`;

              return (
                <Grid item xs={12} sm={6} md={4} key={badgeKey}>
                  <Card sx={{ position: "relative" }}>
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        color: "red",
                        fontSize: "small",
                      }}
                      onClick={() =>
                        handleDelete(badgePath, subCategory, badgeKey)
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {badge.name}
                      </Typography>
                      {badge.description &&
                      typeof badge.description === "object" ? (
                        <>
                          {badge.description.Basic && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Basic:</strong> {badge.description.Basic}
                            </Typography>
                          )}
                          {badge.description.Advanced && (
                            <Typography variant="body2" color="textSecondary">
                              <strong>Advanced:</strong>{" "}
                              {badge.description.Advanced}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          {badge.description || "No description available"}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      );
    });
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Badge List</Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/write")}
          sx={{ py: 1 }}
        >
          Go to Write
        </Button>
      </Box>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="proficiencyAwards">Proficiency Awards</MenuItem>
          <MenuItem value="serviceAwards">Service Awards</MenuItem>
          <MenuItem value="specialAwards">Special Awards</MenuItem>
        </Select>
      </FormControl>

      {category === "proficiencyAwards" && (
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Sub-Filter</InputLabel>
          <Select value={subFilter} onChange={(e) => setSubFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="compulsory">Compulsory</MenuItem>
            <MenuItem value="groupA">Group A</MenuItem>
            <MenuItem value="groupB">Group B</MenuItem>
            <MenuItem value="groupC">Group C</MenuItem>
            <MenuItem value="groupD">Group D</MenuItem>
          </Select>
        </FormControl>
      )}

      {Object.keys(badges).length > 0 ? (
        renderBadges()
      ) : (
        <Typography variant="body1" color="textSecondary" align="center">
          No badges found in this category.
        </Typography>
      )}
    </Box>
  );
};

export default BadgeList;
