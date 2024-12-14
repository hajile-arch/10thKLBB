import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  CircularProgress
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

    // For other categories, directly add badge
    addBadgeToSelection(category, subCategory, badgeKey, badge);
  };

  const addBadgeToSelection = (
    category: string,
    subCategory: string,
    badgeKey: string,
    badge: Badge,
    level?: "Basic" | "Advanced"
  ) => {
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
      // Prepare the new badge object
      const newBadge: SelectedBadge = {
        category,
        subCategory,
        badgeKey,
        ...badge,
        ...(level ? { level } : {}), // Only include level if it is defined
      };
  
      // Add badge to selection
      setSelectedBadges([...selectedBadges, newBadge]);
    }
  
    // Close level selection dialog if open
    if (levelSelectionOpen) {
      setLevelSelectionOpen(null);
    }
  };
  

  // const calculateTotalPoints = () => {
  //   return selectedBadges.reduce((sum, badge) => {
  //     // Check if points exist for the specific level
  //     if (badge.points && badge.level) {
  //       return sum + (badge.points[badge.level] || 0);
  //     }
  //     return sum;
  //   }, 0);
  // };

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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Badge Selection</Typography>
        <Box>
          <Typography variant="subtitle1">
            Total Selected: {selectedBadges.length} badges
          </Typography>
          {/* <Typography variant="subtitle2" color="textSecondary">
            Total Points: {calculateTotalPoints()}
          </Typography> */}
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
