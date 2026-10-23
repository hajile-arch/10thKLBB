import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trophy, X } from 'lucide-react';
import { getDataFromFirebase } from '../firebase/firebaseUtils.ts';
import { 
  BadgesStructure, 
  SelectedBadge,
  Badge
} from '../types.ts';
import { BadgeLevelDialog } from '../components/addBadges/BadgeLevelDialog.tsx.tsx';
import { BadgeCategoryRenderer } from '../components/addBadges/BadgeCategoryRenderer.tsx.tsx';

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
  const [search, setSearch] = useState('');

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

  const removeBadgeAt = (index: number) => {
    setSelectedBadges((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPoints = selectedBadges.reduce(
    (sum, b) => sum + (b.level ? b.points?.[b.level] ?? 0 : 0),
    0
  );

  // Narrow the badge tree to names/descriptions matching the search text
  const visibleBadges = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return badges;

    const result: BadgesStructure = {};
    Object.entries(badges).forEach(([category, subCategories]) => {
      Object.entries(subCategories).forEach(([subCategory, items]) => {
        Object.entries(items).forEach(([badgeKey, badge]) => {
          const text = `${badge.name} ${
            typeof badge.description === 'object'
              ? Object.values(badge.description).join(' ')
              : badge.description
          }`.toLowerCase();
          if (!text.includes(query)) return;
          result[category] ??= {};
          result[category][subCategory] ??= {};
          result[category][subCategory][badgeKey] = badge;
        });
      });
    });
    return result;
  }, [badges, search]);

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
      <div className="w-full p-4 md:p-6 space-y-4" aria-busy="true">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-600 dark:text-red-400 text-lg font-semibold">{error}</div>
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
          <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg p-6 w-11/12 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Number of Badges</h3>
            <select
              value={desiredCount}
              onChange={(e) => setDesiredCount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded mb-4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
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

      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-gray-800 dark:text-gray-100">
            <Trophy className="h-6 w-6 text-amber-500" />
            Pick your badges
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tap a badge to add it, tap again to remove.</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent leading-none">
            {selectedBadges.length}
          </div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            selected{totalPoints > 0 && ` · ${totalPoints} pts`}
          </div>
        </div>
      </div>

      {/* Sticky tray: search + selected chips */}
      <div className="sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 bg-gray-100/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search badges…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
          />
        </div>

        {selectedBadges.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mb-1">
            {selectedBadges.map((badge, index) => (
              <span
                key={`${badge.category}-${badge.subCategory}-${badge.badgeKey}-${badge.level ?? ""}-${index}`}
                className="inline-flex items-center gap-1 shrink-0 pl-3 pr-1 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-sm"
              >
                {badge.name}
                {badge.level && <span className="text-white/75 text-xs">· {badge.level}</span>}
                <button
                  type="button"
                  onClick={() => removeBadgeAt(index)}
                  aria-label={`Remove ${badge.name}`}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-white/25 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {Object.keys(visibleBadges).length > 0 ? (
        <BadgeCategoryRenderer
          badges={visibleBadges}
          selectedBadges={selectedBadges}
          handleBadgeSelect={handleBadgeSelect}
          fancy
          expandAll={search.trim() !== ''}
        />
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <div className="text-4xl mb-2">🔍</div>
          {search ? `No badges match "${search}".` : 'No badges found.'}
        </div>
      )}
    </div>
  );
};

export default AwardBadgeSelection;