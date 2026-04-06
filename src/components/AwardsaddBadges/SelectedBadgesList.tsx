
  // SelectedBadgesList.tsx
  import React from 'react';
  import { 
    Box, 
    Typography, 
    Grid, 
    Card, 
    CardContent,
    Chip
  } from '@mui/material';
  import { SelectedBadge } from '../../types';
  
  interface SelectedBadgesListProps {
    selectedBadges: SelectedBadge[];
  }
  
  export const SelectedBadgesList: React.FC<SelectedBadgesListProps> = ({ 
    selectedBadges 
  }) => {
    if (selectedBadges.length === 0) return null;
  
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Selected Badges</Typography>
        <Grid container spacing={2}>
          {selectedBadges.map((badge, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {badge.name} 
                      {badge.level && ` (${badge.level} Level)`}
                    </Typography>
                    {badge.points && badge.level && (
                      <Chip 
                        label={`${badge.points[badge.level]} pts`} 
                        color="primary" 
                        size="small" 
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {typeof badge.description === 'object'
                      ? badge.description[badge.level || 'Basic']
                      : badge.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  