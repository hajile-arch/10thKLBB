import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { SelectedBadge } from "../../types";
import { ChevronLeft, Plus } from "lucide-react";
import BadgeLevelModal from './BadgeLevelModal';

interface BadgeSelectionInterfaceProps {
  onAddBadge: (badge: SelectedBadge) => void;
  existingBadges: SelectedBadge[];
}

const BadgeSelectionInterface: React.FC<BadgeSelectionInterfaceProps> = ({ onAddBadge, existingBadges }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subcategoryBadges, setSubcategoryBadges] = useState<SelectedBadge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<SelectedBadge | null>(null);

  const categoryDisplayNames: Record<string, string> = {
    proficiencyAwards: "Proficiency Awards",
    serviceAwards: "Service Awards",
    specialAwards: "Special Awards"
  };

  const subcategoryDisplayNames: Record<string, string> = {
    compulsory: "Compulsory",
    groupA: "Group A",
    groupB: "Group B",
    groupC: "Group C",
    groupD: "Group D",
  };

  const ownedLevels = (name: string) =>
    existingBadges
      .filter((b) => b.name?.trim() === name?.trim())
      .map((b) => b.level || "Added");

  useEffect(() => {
    const db = getDatabase();
    const badgesRef = ref(db, "badges");

    const unsubscribe = onValue(badgesRef, (snapshot) => {
      if (snapshot.exists()) {
        setCategories(Object.keys(snapshot.val()));
      } else {
        setCategories([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setLoading(true);

    const db = getDatabase();
    const categoryRef = ref(db, `badges/${category}`);

    onValue(categoryRef, (snapshot) => {
      setSubcategories(snapshot.exists() ? Object.keys(snapshot.val()) : []);
      setLoading(false);
    });
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setLoading(true);

    const db = getDatabase();
    const subcategoryRef = ref(db, `badges/${selectedCategory}/${subcategory}`);

    onValue(subcategoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const badges = Object.entries(snapshot.val()).map(([badgeKey, badgeData]: [string, any]) => ({
          ...badgeData,
          category: selectedCategory!,
          subCategory: subcategory,
          badgeKey,
        }));
        setSubcategoryBadges(badges as SelectedBadge[]);
      } else {
        setSubcategoryBadges([]);
      }
      setLoading(false);
    });
  };

  const handleAddBadge = (badge: SelectedBadge) => {
    if (selectedCategory === "serviceAwards" || selectedCategory === "specialAwards") {
      // For service and special awards, omit the level field entirely
      const { level, ...badgeWithoutLevel } = badge;
      onAddBadge(badgeWithoutLevel);
    } else {
      const existingBadge = existingBadges.find(
        (b) => b.name === badge.name && (b.level === "Basic" || b.level === "Advanced")
      );

      if (existingBadge) {
        const hasBasic = existingBadges.some((b) => b.name === badge.name && b.level === "Basic");
        const hasAdvanced = existingBadges.some((b) => b.name === badge.name && b.level === "Advanced");

        if (hasBasic && hasAdvanced) {
          alert(`You already have both Basic and Advanced levels for this badge.`);
          return;
        }
      }
      
      setSelectedBadge(badge);
      setIsModalOpen(true);
    }
  };

  const handleLevelSelect = (level: "Basic" | "Advanced") => {
    if (selectedBadge) {
      const hasBasic = existingBadges.some((b) => b.name === selectedBadge.name && b.level === "Basic");
      const hasAdvanced = existingBadges.some((b) => b.name === selectedBadge.name && b.level === "Advanced");

      if ((hasBasic && level === "Basic") || (hasAdvanced && level === "Advanced")) {
        alert(`You already have the ${level} level for this badge.`);
        return;
      }

      onAddBadge({ ...selectedBadge, level });
      setIsModalOpen(false);
    }
  };

  const optionClasses =
    "w-full flex items-center justify-between gap-3 rounded-lg bg-gray-700 px-4 py-3 text-left text-white hover:bg-gray-600 transition-colors";

  const backButton = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center text-sm text-gray-300 hover:text-white shrink-0"
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      Back
    </button>
  );

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">Add a Badge</h3>
          {selectedCategory && (
            <p className="text-sm text-gray-400 truncate">
              {categoryDisplayNames[selectedCategory] || selectedCategory}
              {selectedSubcategory &&
                ` › ${subcategoryDisplayNames[selectedSubcategory] || selectedSubcategory}`}
            </p>
          )}
        </div>
        {selectedSubcategory
          ? backButton(() => {
              setSelectedSubcategory(null);
              setSubcategoryBadges([]);
            })
          : selectedCategory
          ? backButton(() => {
              setSelectedCategory(null);
              setSubcategories([]);
            })
          : null}
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={optionClasses}
            >
              <span className="font-medium">{categoryDisplayNames[category] || category}</span>
              <Plus className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      ) : !selectedSubcategory ? (
        loading ? (
          <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {subcategories.map((subcategory) => (
              <button
                type="button"
                key={subcategory}
                onClick={() => handleSubcategorySelect(subcategory)}
                className={optionClasses}
              >
                <span className="font-medium">
                  {subcategoryDisplayNames[subcategory] || subcategory}
                </span>
                <Plus className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        )
      ) : loading ? (
        <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
            </div>
      ) : (
        <ul className="divide-y divide-gray-700 rounded-lg border border-gray-700 overflow-hidden">
          {subcategoryBadges.map((badge) => {
            const owned = ownedLevels(badge.name);
            return (
              <li
                key={badge.badgeKey || badge.name}
                className="flex items-center justify-between gap-3 bg-gray-800 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white">{badge.name}</p>
                  {owned.length > 0 && (
                    <p className="text-xs text-gray-400">Has: {owned.join(", ")}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddBadge(badge)}
                  className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <BadgeLevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLevel={handleLevelSelect}
      />
    </div>
  );
};
export default BadgeSelectionInterface;