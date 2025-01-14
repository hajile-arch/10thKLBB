// BadgeSelectionInterface.tsx
// [Previous BadgeSelectionInterface code remains exactly the same]

// EditBadgeList.tsx
import React from "react";
import { SelectedBadge } from "../../types";
import { FaTrash } from "react-icons/fa";
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
    <div className="mr-6">
      {/* Badge display section */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 text-white">Your Badges</h3>
        {Object.keys(groupedBadges).length > 0 ? (
          Object.keys(groupedBadges).map((category) => (
            <div key={category}>
              <h4 className="text-lg font-bold mb-2 mt-5 text-white italic">
                {categoryDisplayNames[category] || category}
              </h4>
              {Object.keys(groupedBadges[category]).map((subcategory) => (
                <div key={subcategory}>
                  <h5 className="text-md font-semibold mb-2 mt-5 text-white">
                    {subcategoryDisplayNames[subcategory] || subcategory}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupedBadges[category][subcategory].map(({ badge, index }) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-300 rounded-md flex flex-col items-center justify-between text-center bg-white shadow-lg transition-all transform hover:scale-105"
                        style={{ height: "130px", width: "130px" }}
                      >
                        <div className="flex flex-col justify-center items-center h-full">
                          <h4 className="font-semibold text-lg">{badge.name}</h4>
                          <span className="text-sm font-medium text-gray-600">{badge.level}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteBadge(index)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-300"
                          aria-label="Delete Badge"
                        >
                          <FaTrash size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No badges assigned yet.</p>
        )}
      </div>

      <BadgeSelectionInterface onAddBadge={onAddBadge} existingBadges={badges} />
    </div>
  );
};

export default EditBadgeList;