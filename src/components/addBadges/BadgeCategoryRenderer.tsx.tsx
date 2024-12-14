
  // 
  import React from 'react';
  import { 
    Box, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    CardActionArea,
    Chip
  } from '@mui/material';
  import { BadgesStructure, SelectedBadge } from '../../types';
  
  interface BadgeCategoryRendererProps {
    badges: BadgesStructure;
    selectedBadges: SelectedBadge[];
    handleBadgeSelect: (category: string, subCategory: string, badgeKey: string) => void;
  }
  
  export const BadgeCategoryRenderer: React.FC<BadgeCategoryRendererProps> = ({
    badges,
    selectedBadges,
    handleBadgeSelect
  }) => {
    return (
      <>
        {Object.keys(badges).map((category) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, textTransform: 'capitalize' }}>
              {category.replace('Awards', ' Awards')}
            </Typography>
            {Object.keys(badges[category]).map((subCategory) => (
              <Box key={subCategory} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                  {subCategory}
                </Typography>
                <Grid container spacing={2}>
                  {Object.keys(badges[category][subCategory]).map((badgeKey) => {
                    const badge = badges[category][subCategory][badgeKey];
                    
                    const selectedVersions = selectedBadges.filter(
                      (selected) => 
                        selected.category === category && 
                        selected.subCategory === subCategory && 
                        selected.badgeKey === badgeKey
                    );
  
                    return (
                      <Grid item xs={12} sm={6} md={4} key={badgeKey}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            border: selectedVersions.length > 0 
                              ? '2px solid primary.main' 
                              : 'none' 
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleBadgeSelect(category, subCategory, badgeKey)}
                            sx={{ height: '100%' }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">{badge.name}</Typography>
                                {category === 'proficiencyAwards' && (
                                  <Box>
                                    {selectedVersions.map(version => (
                                      <Chip 
                                        key={version.level}
                                        label={version.level} 
                                        color="primary"
                                        size="small"
                                        sx={{ mr: 1 }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                {typeof badge.description === 'object'
                                  ? badge.description.Basic || badge.description.Advanced
                                  : badge.description}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))}
          </Box>
        ))}
      </>
    );
  };
  