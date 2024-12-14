  // 
  import React from 'react';
  import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Typography, 
    Card, 
    CardContent, 
    DialogActions, 
    Button,
    Chip
  } from '@mui/material';
  import { Badge, SelectedBadge } from '../../types';
  
  interface BadgeLevelDialogProps {
    open: boolean;
    onClose: () => void;
    levelSelectionOpen: {
      category?: string;
      subCategory?: string;
      badgeKey?: string;
      badge?: Badge;
    } | null;
    selectedBadges: SelectedBadge[];
    addBadgeToSelection: (
      category: string, 
      subCategory: string, 
      badgeKey: string, 
      badge: Badge, 
      level?: 'Basic' | 'Advanced'
    ) => void;
  }
  
  export const BadgeLevelDialog: React.FC<BadgeLevelDialogProps> = ({
    open,
    onClose,
    levelSelectionOpen,
    selectedBadges,
    addBadgeToSelection
  }) => {
    if (!levelSelectionOpen || !levelSelectionOpen.badge) return null;
  
    const { badge, category, subCategory, badgeKey } = levelSelectionOpen;
    const description = typeof badge.description === 'object' ? badge.description : {};
  
    const renderLevelCard = (level: 'Basic' | 'Advanced') => {
      if (!description[level]) return null;
  
      const isSelected = selectedBadges.some(b => 
        b.category === category &&
        b.subCategory === subCategory &&
        b.badgeKey === badgeKey &&
        b.level === level
      );
  
      return (
        <Card 
          sx={{ 
            mb: 2, 
            cursor: 'pointer',
            border: isSelected ? '2px solid primary.main' : 'none'
          }}
          onClick={() => addBadgeToSelection(
            category!, 
            subCategory!, 
            badgeKey!, 
            badge!, 
            level
          )}
        >
          <CardContent>
            <Typography variant="subtitle1">{level} Level</Typography>
            <Typography variant="body2" color="textSecondary">
              {description[level]}
            </Typography>
            {badge.points?.[level] && (
              <Chip 
                label={`${badge.points[level]} pts`} 
                size="small" 
                color="primary" 
                sx={{ mt: 1 }} 
              />
            )}
          </CardContent>
        </Card>
      );
    };
  
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Badge Level</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {badge.name}
          </Typography>
          
          {renderLevelCard('Basic')}
          {renderLevelCard('Advanced')}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  };