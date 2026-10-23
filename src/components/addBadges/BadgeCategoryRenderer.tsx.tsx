import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { BadgesStructure, SelectedBadge } from "../../types";

interface BadgeCategoryRendererProps {
  badges: BadgesStructure;
  selectedBadges: SelectedBadge[];
  handleBadgeSelect: (
    category: string,
    subCategory: string,
    badgeKey: string
  ) => void;
  // Opt-in styled look with collapsible categories (used by the Awards page)
  fancy?: boolean;
  // Force every category open, e.g. while searching
  expandAll?: boolean;
}

export const BadgeCategoryRenderer: React.FC<BadgeCategoryRendererProps> = (props) => {
  if (props.fancy) return <FancyBadgeCategoryRenderer {...props} />;

  const { badges, selectedBadges, handleBadgeSelect } = props;
  return (
    <div className="space-y-6">
      {Object.keys(badges).map((category) => (
        <div key={category} className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 capitalize">
            {category.replace("Awards", " Awards")}
          </h2>

          {Object.keys(badges[category]).map((subCategory) => (
            <div key={subCategory} className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">
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
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:hover:border-gray-600"
                      }`}
                    >
                      <button
                        onClick={() => handleBadgeSelect(category, subCategory, badgeKey)}
                        className="w-full h-full text-left p-4 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base">
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
                                        ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800"
                                        : "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800"
                                    }`}
                                  >
                                    {version.level}
                                  </span>
                                ))}
                              </>
                            )}

                            {isSpecialOrService && isSelected && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
                                Selected
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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

const CATEGORY_ACCENTS = [
  "from-blue-500 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-500 to-pink-500",
];

const FancyBadgeCategoryRenderer: React.FC<BadgeCategoryRendererProps> = ({
  badges,
  selectedBadges,
  handleBadgeSelect,
  expandAll = false,
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) =>
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));

  return (
    <div className="space-y-4">
      {Object.keys(badges).map((category, categoryIndex) => {
        const isOpen = expandAll || !collapsed[category];
        const badgeCount = Object.values(badges[category]).reduce(
          (sum, sub) => sum + Object.keys(sub).length,
          0
        );
        const selectedCount = selectedBadges.filter((b) => b.category === category).length;
        const accent = CATEGORY_ACCENTS[categoryIndex % CATEGORY_ACCENTS.length];

        return (
          <section
            key={category}
            className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <span className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${accent}`} />
              <span className="flex-1">
                <span className="block text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">
                  {category.replace("Awards", " Awards")}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {badgeCount} badges
                </span>
              </span>
              {selectedCount > 0 && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${accent}`}>
                  {selectedCount} picked
                </span>
              )}
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-5">
                {Object.keys(badges[category]).map((subCategory) => (
                  <div key={subCategory}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      {subCategory}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.keys(badges[category][subCategory]).map((badgeKey) => {
                        const badge = badges[category][subCategory][badgeKey];
                        const selectedVersions = selectedBadges.filter(
                          (selected) =>
                            selected.category === category &&
                            selected.subCategory === subCategory &&
                            selected.badgeKey === badgeKey
                        );
                        const isSelected = selectedVersions.length > 0;

                        return (
                          <button
                            key={badgeKey}
                            type="button"
                            onClick={() => handleBadgeSelect(category, subCategory, badgeKey)}
                            className={`group relative text-left p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] ${
                              isSelected
                                ? "border-amber-400 bg-amber-50 ring-2 ring-amber-400/60 dark:bg-amber-400/10 dark:border-amber-400/70"
                                : "border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-500/60"
                            }`}
                          >
                            <span
                              className={`absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-amber-400 text-white scale-100"
                                  : "border border-gray-300 dark:border-gray-700 text-transparent scale-90 group-hover:border-indigo-400"
                              }`}
                            >
                              <Check className="h-4 w-4" strokeWidth={3} />
                            </span>

                            <div className="flex items-center gap-3 pr-8">
                              {badge.iconUrl && (
                                <img
                                  src={badge.iconUrl}
                                  alt=""
                                  className="h-10 w-10 object-contain shrink-0"
                                  onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                              )}
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base">
                                {badge.name}
                              </h4>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                              {typeof badge.description === "object"
                                ? badge.description.Basic || badge.description.Advanced
                                : badge.description}
                            </p>

                            {category === "proficiencyAwards" && selectedVersions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {selectedVersions.map((version) => (
                                  <span
                                    key={version.level}
                                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                      version.level === "Basic"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                                    }`}
                                  >
                                    {version.level}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
