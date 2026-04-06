import React, { useState, useEffect } from 'react';
import { getDataFromFirebase } from '../firebase/firebaseUtils.ts';
import { 
  BadgesStructure, 
  SelectedBadge,
  Badge
} from '../types.ts';
import { BadgeLevelDialog } from '../components/addBadges/BadgeLevelDialog.tsx.tsx';
import { BadgeCategoryRenderer } from '../components/addBadges/BadgeCategoryRenderer.tsx.tsx';
import { SelectedBadgesList } from '../components/addBadges/SelectedBadgesList.tsx';

interface BadgeSelectionProps {
  selectedBadges: SelectedBadge[];
  setSelectedBadges: React.Dispatch<React.SetStateAction<SelectedBadge[]>>;
}

export const AwardBadgeSelection: React.FC<BadgeSelectionProps> = ({
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
          let badgeData = result.data || {};
          const hiddenBadges = ["President's Badge", "Founder's Badge", "NCO Proficiency Star"];
          badgeData = filterBadges(badgeData, hiddenBadges);
          setBadges(badgeData);
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

  const filterBadges = (badgeData: BadgesStructure, hiddenBadges: string[]): BadgesStructure => {
    const filteredData: BadgesStructure = {};
    
    Object.entries(badgeData).forEach(([category, subCategories]) => {
      filteredData[category] = {};
      
      Object.entries(subCategories).forEach(([subCategory, badges]) => {
        filteredData[category][subCategory] = {};
        
        Object.entries(badges).forEach(([badgeKey, badge]) => {
          if (!hiddenBadges.includes(badge.name)) {
            filteredData[category][subCategory][badgeKey] = badge;
          }
        });
      });
    });
    
    return filteredData;
  };

  const handleBadgeSelect = (category: string, subCategory: string, badgeKey: string) => {
    const badge = badges[category][subCategory][badgeKey];
    
    if (category === 'proficiencyAwards') {
      setLevelSelectionOpen({ category, subCategory, badgeKey, badge });
      return;
    }
    
    

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
      const newBadges = Array.from({ length: count }, () => ({
        category,
        subCategory,
        badgeKey,
        ...badge,
        ...(level ? { level } : {}),
      }));

      setSelectedBadges([...selectedBadges, ...newBadges]);

      if (level === "Advanced") {
        const basicBadge = badges[category]?.[subCategory]?.[badgeKey];
        if (basicBadge && !selectedBadges.some(
            (selected) =>
              selected.category === category &&
              selected.subCategory === subCategory &&
              selected.badgeKey === badgeKey &&
              selected.level === "Basic"
          )) {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <BadgeLevelDialog 
        open={!!levelSelectionOpen} 
        onClose={() => setLevelSelectionOpen(null)}
        levelSelectionOpen={levelSelectionOpen}
        selectedBadges={selectedBadges}
        addBadgeToSelection={addBadgeToSelection}
      />

      {/* Number Dialog */}
      {numberDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Number of Badges</h3>
            <select
              value={desiredCount}
              onChange={(e) => setDesiredCount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              {[...Array(10)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setNumberDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleNumberDialogSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Badge Selection</h2>
        <div className="text-sm sm:text-base font-medium text-gray-600">
          Total Selected: {selectedBadges.length} badges
        </div>
      </div>

      {Object.keys(badges).length > 0 ? (
        <BadgeCategoryRenderer 
          badges={badges} 
          selectedBadges={selectedBadges}
          handleBadgeSelect={handleBadgeSelect}
        />
      ) : (
        <div className="text-center text-gray-500 py-8">
          No badges found.
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button 
          disabled={selectedBadges.length === 0}
          className={`px-6 py-2 rounded ${
            selectedBadges.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Confirm Selection ({selectedBadges.length} badges)
        </button>
      </div>

      <SelectedBadgesList selectedBadges={selectedBadges} />
    </div>
  );
};

export default AwardBadgeSelection;