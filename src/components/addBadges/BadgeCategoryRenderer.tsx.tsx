import React from "react";
import { BadgesStructure, SelectedBadge } from "../../types";

interface BadgeCategoryRendererProps {
  badges: BadgesStructure;
  selectedBadges: SelectedBadge[];
  handleBadgeSelect: (
    category: string,
    subCategory: string,
    badgeKey: string
  ) => void;
}

export const BadgeCategoryRenderer: React.FC<BadgeCategoryRendererProps> = ({
  badges,
  selectedBadges,
  handleBadgeSelect,
}) => {
  return (
    <div className="space-y-6">
      {Object.keys(badges).map((category) => (
        <div key={category} className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
            {category.replace("Awards", " Awards")}
          </h2>
          
          {Object.keys(badges[category]).map((subCategory) => (
            <div key={subCategory} className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3 capitalize">
                {subCategory}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(badges[category][subCategory]).map((badgeKey) => {
                  const badge = badges[category][subCategory][badgeKey];
                  const selectedVersions = selectedBadges.filter(
                    (selected) =>
                      selected.category === category &&
                      selected.subCategory === subCategory &&
                      selected.badgeKey === badgeKey
                  );
                  const isSpecialOrService = category === "specialAwards" || category === "serviceAwards";
                  const isSelected = selectedVersions.length > 0;

                  return (
                    <div
                      key={badgeKey}
                      className={`border rounded-lg overflow-hidden transition-all ${
                        isSelected
                          ? "border-blue-500 border-2 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <button
                        onClick={() => handleBadgeSelect(category, subCategory, badgeKey)}
                        className="w-full h-full text-left p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                            {badge.name}
                          </h4>
                          
                          <div className="flex flex-wrap gap-1">
                            {category === "proficiencyAwards" && (
                              <>
                                {selectedVersions.map((version) => (
                                  <span
                                    key={version.level}
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      version.level === "Basic"
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    }`}
                                  >
                                    {version.level}
                                  </span>
                                ))}
                              </>
                            )}
                            
                            {isSpecialOrService && isSelected && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                                Selected
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2">
                          {typeof badge.description === "object"
                            ? badge.description.Basic || badge.description.Advanced
                            : badge.description}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};