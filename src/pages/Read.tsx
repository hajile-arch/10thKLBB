import { useState, useEffect } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  getDataFromFirebase,
  deleteDataFromFirebase,
  uploadToFirebase,
} from "../firebase/firebaseUtils";
import DeleteIcon from "@mui/icons-material/Delete";
import { Navigate, useNavigate } from "react-router-dom";

const BadgeList = () => {
  const [badges, setBadges] = useState<any>({});
  const [category, setCategory] = useState<string>("proficiencyAwards");
  const [subFilter, setSubFilter] = useState<string>("all");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const navigate = useNavigate();
  const [deleteInfo, setDeleteInfo] = useState<{
    badgePath: string;
    subCategory: string;
    badgeKey: string;
  } | null>(null);
  

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

  const generateRandomPassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
  };

  const handleDeleteIconClick = async (badgePath: string, subCategory: string, badgeKey: string) => {
  const randomPassword = generateRandomPassword();
  setGeneratedPassword(randomPassword);
  
  // Overwrite the password in Firebase
  const passwordPath = "admin/passwords/currentPassword"; // Ensure this is a unique path
  const result = await uploadToFirebase(passwordPath, { password: randomPassword });

  if (result.success) {
    console.log("Password updated in Firebase.");
  } else {
    alert("Failed to update password in Firebase.");
    return;
  }

  // Set delete information for reference
  setDeleteInfo({ badgePath, subCategory, badgeKey });
  
  // Open the password dialog
  setPasswordDialogOpen(true);
};

  
  const handlePasswordSubmit = async () => {
    if (!deleteInfo) return;
  
    const { badgePath, subCategory, badgeKey } = deleteInfo;
  
    if (passwordInput === generatedPassword) {
      await handleDelete(badgePath, subCategory, badgeKey);
      setPasswordDialogOpen(false);
      setPasswordInput("");
      setDeleteInfo(null); // Reset delete info after successful deletion
    } else {
      alert("Nice try la, you think you Mr Em meh. 🤡");
      setPasswordInput("");
    }
  };
  const handleDelete = async (badgePath: string, subCategory: string, badgeKey: string) => {
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
                        handleDeleteIconClick(badgePath, subCategory, badgeKey)
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
      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Enter Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the password to proceed with deleting the badge.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="text"
            fullWidth
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePasswordSubmit} color="secondary">
  Submit
</Button>

        </DialogActions>
      </Dialog>

      {/* Main Content */}
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
