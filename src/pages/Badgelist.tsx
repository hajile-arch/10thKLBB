import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { getDataFromFirebase } from '../firebase/firebaseUtils';
import { 
  BadgesStructure, 
  SelectedBadge,
  Badge
} from '../types';
import { BadgeLevelDialog } from '../components/addBadges/BadgeLevelDialog.tsx';
import { BadgeCategoryRenderer } from '../components/addBadges/BadgeCategoryRenderer.tsx';
import { SelectedBadgesList } from '../components/addBadges/SelectedBadgesList.tsx';

interface BadgeSelectionProps {
  selectedBadges: SelectedBadge[];
  setSelectedBadges: React.Dispatch<React.SetStateAction<SelectedBadge[]>>;
}

export const BadgeSelection: React.FC<BadgeSelectionProps> = ({
  selectedBadges,
  setSelectedBadges,
}) => {
  const [badges, setBadges] = useState<BadgesStructure>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [levelSelectionOpen, setLevelSelectionOpen] = useState<{
    category?: string;
    subCategory?: string;
    badgeKey?: string;
    badge?: Badge;
  } | null>(null);
  const [numberDialogOpen, setNumberDialogOpen] = useState(false);
  const [badgeToAdd, setBadgeToAdd] = useState<{ category: string; subCategory: string; badge: Badge } | null>(null);
  const [desiredCount, setDesiredCount] = useState<number>(1);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const result = await getDataFromFirebase('badges');
        
        if (result.success) {
          setBadges(result.data || {});
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch badges');
        }
      } catch (err) {
        setError('An error occurred while fetching badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const handleBadgeSelect = (category: string, subCategory: string, badgeKey: string) => {
    const badge = badges[category][subCategory][badgeKey];
    
    // For Proficiency Awards, open level selection dialog
    if (category === 'proficiencyAwards') {
      setLevelSelectionOpen({ category, subCategory, badgeKey, badge });
      return;
    }
    
    // For "One Year Service" badges, open number dialog
    if (badge.name === 'One Year Service') {
      setBadgeToAdd({ category, subCategory, badge });
      setNumberDialogOpen(true);
      return;
    }

    // For other categories, directly add badge
    addBadgeToSelection(category, subCategory, badgeKey, badge);
  };

  const addBadgeToSelection = (
    category: string,
    subCategory: string,
    badgeKey: string,
    badge: Badge,
    level?: "Basic" | "Advanced",
    count: number = 1
  ) => {
    // Skip adding President or Founder badges
    if (badge.name === "President" || badge.name === "Founder") {
      return;
    }

    const isAlreadySelected = selectedBadges.some(
      (selected) =>
        selected.category === category &&
        selected.subCategory === subCategory &&
        selected.badgeKey === badgeKey &&
        selected.level === level
    );

    if (isAlreadySelected) {
      // Remove badge if already selected
      setSelectedBadges(
        selectedBadges.filter(
          (selected) =>
            !(
              selected.category === category &&
              selected.subCategory === subCategory &&
              selected.badgeKey === badgeKey &&
              selected.level === level
            )
        )
      );
    } else {
      // Prepare the new badge objects
      const newBadges = Array.from({ length: count }, () => ({
        category,
        subCategory,
        badgeKey,
        ...badge,
        ...(level ? { level } : {}), // Only include level if it is defined
      }));

      // Add badges to selection
      setSelectedBadges([...selectedBadges, ...newBadges]);

      // If "Advanced" badge is selected, automatically select the "Basic" version as well
      if (level === "Advanced") {
        // Check if Basic version exists and is not already selected
        const basicBadge = badges[category]?.[subCategory]?.[badgeKey];
        if (basicBadge && !selectedBadges.some(
            (selected) =>
              selected.category === category &&
              selected.subCategory === subCategory &&
              selected.badgeKey === badgeKey &&
              selected.level === "Basic"
          )) {
          // Add Basic badge to selection
          setSelectedBadges((prevSelectedBadges) => [
            ...prevSelectedBadges,
            {
              category,
              subCategory,
              badgeKey,
              ...basicBadge,
              level: "Basic",
            },
          ]);
        }
      }
    }

    // Close level selection dialog if open
    if (levelSelectionOpen) {
      setLevelSelectionOpen(null);
    }
  };

  const handleNumberDialogSubmit = () => {
    if (badgeToAdd) {
      const { category, subCategory, badge } = badgeToAdd;
      addBadgeToSelection(category, subCategory, badge.name, badge, undefined, desiredCount);
    }
    setNumberDialogOpen(false);
    setBadgeToAdd(null);
    setDesiredCount(1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BadgeLevelDialog 
        open={!!levelSelectionOpen} 
        onClose={() => setLevelSelectionOpen(null)}
        levelSelectionOpen={levelSelectionOpen}
        selectedBadges={selectedBadges}
        addBadgeToSelection={addBadgeToSelection}
      />

      <Dialog open={numberDialogOpen} onClose={() => setNumberDialogOpen(false)}>
        <DialogTitle>Select Number of Badges</DialogTitle>
        <DialogContent>
          <TextField
            label="Number of badges (1-10)"
            type="number"
            value={desiredCount}
            onChange={(e) => setDesiredCount(Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 10))}
            fullWidth
            InputProps={{ inputProps: { min: 1, max: 10 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNumberDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNumberDialogSubmit} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Badge Selection</Typography>
        <Box>
          <Typography variant="subtitle1">
            Total Selected: {selectedBadges.length} badges
          </Typography>
        </Box>
      </Box>

      {Object.keys(badges).length > 0 ? (
        <BadgeCategoryRenderer 
          badges={badges} 
          selectedBadges={selectedBadges}
          handleBadgeSelect={handleBadgeSelect}
        />
      ) : (
        <Typography variant="body1" color="textSecondary" align="center">
          No badges found.
        </Typography>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary"
          disabled={selectedBadges.length === 0}
        >
          Confirm Selection ({selectedBadges.length} badges)
        </Button>
      </Box>

      <SelectedBadgesList selectedBadges={selectedBadges} />
    </Container>
  );
};

export default BadgeSelection;
