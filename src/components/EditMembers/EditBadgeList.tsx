// BadgeSelectionInterface.tsx
// [Previous BadgeSelectionInterface code remains exactly the same]

// EditBadgeList.tsx
import React from "react";
import { SelectedBadge } from "../../types";
import { Trash2 } from "lucide-react";
import BadgeSelectionInterface from "./BadgeSelectionInterface";

interface EditBadgeListProps {
  badges: SelectedBadge[];
  onDeleteBadge: (badgeIndex: number) => void;  // Keep the index-based deletion
  onAddBadge: (badge: SelectedBadge) => void;
}

const EditBadgeList: React.FC<EditBadgeListProps> = ({ badges, onDeleteBadge, onAddBadge }) => {
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

  // Create a mapping to store the original indices
  const badgesWithIndices = badges.map((badge, index) => ({ badge, index }));

  // Group badges by category and subcategory while preserving original indices
  const groupedBadges = badgesWithIndices.reduce((acc, { badge, index }) => {
    const category = badge.category || "Unknown";
    const subCategory = badge.subCategory || "Unknown";

    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subCategory]) {
      acc[category][subCategory] = [];
    }
    acc[category][subCategory].push({ badge, index });

    return acc;
  }, {} as Record<string, Record<string, Array<{ badge: SelectedBadge; index: number }>>>);

  return (
    <div className="space-y-8">
      {/* Badge display section */}
      <div>
        <h3 className="text-lg font-semibold text-white">
          Current Badges{" "}
          <span className="text-sm font-normal text-gray-400">({badges.length})</span>
        </h3>
        {Object.keys(groupedBadges).length > 0 ? (
          <div className="mt-3 space-y-5">
            {Object.keys(groupedBadges).map((category) => (
              <div key={category}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {categoryDisplayNames[category] || category}
                </h4>
                {Object.keys(groupedBadges[category]).map((subcategory) => (
                  <div key={subcategory} className="mt-2">
                    {category === "proficiencyAwards" && (
                      <h5 className="text-sm text-gray-300 mb-1.5">
                        {subcategoryDisplayNames[subcategory] || subcategory}
                      </h5>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {groupedBadges[category][subcategory].map(({ badge, index }) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gray-700 border border-gray-600 pl-3 pr-1 py-1 text-sm text-white"
                        >
                          {badge.name}
                          {badge.level && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                badge.level === "Advanced"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-blue-500/20 text-blue-300"
                              }`}
                            >
                              {badge.level}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteBadge(index)}
                            className="rounded-full p-1 text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                            aria-label={`Remove ${badge.name}${badge.level ? ` (${badge.level})` : ""}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No badges yet. Add one below.</p>
        )}
      </div>

      <BadgeSelectionInterface onAddBadge={onAddBadge} existingBadges={badges} />
    </div>
  );
};

export default EditBadgeList;
