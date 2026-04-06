import React from "react";
import { SelectedBadge } from "../../enum";

interface BadgesListProps {
  badges: BadgeWithDescription[];
}

type BadgeWithDescription = SelectedBadge & {
  description?: {
    Basic?: string;
    Advanced?: string;
  };
};


const getBadgeImage = (name: string) =>
  `/images/badges/${name.toLowerCase().replace(/\s+/g, "-")}.png`;

const getBadgeDetails = (badge: SelectedBadge): string | null => {
  if (!badge.description) return null;

  if (
    badge.level === "Advanced" &&
    badge.description.Advanced
  ) {
    return badge.description.Advanced;
  }

  if (
    badge.level === "Basic" &&
    badge.description.Basic
  ) {
    return badge.description.Basic;
  }

  // fallback if no level-specific
  return (
    badge.description.Basic ??
    badge.description.Advanced ??
    null
  );
};

const BadgesList: React.FC<BadgesListProps> = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No badges recorded.
      </p>
    );
  }
console.log("BadgesList received badges:", badges);

  /**
   * category -> subCategory -> SelectedBadge[]
   */

  
  const grouped = badges.reduce<
    Record<string, Record<string, SelectedBadge[]>>
  >((acc, badge) => {
    const category = badge.category || "Others";
    const subCategory = badge.subCategory || "General";

    if (!acc[category]) acc[category] = {};
    if (!acc[category][subCategory]) acc[category][subCategory] = [];

    acc[category][subCategory].push(badge);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, subCategories]) => (
        <div key={category}>
          {/* Category */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {category}
          </h3>

          {Object.entries(subCategories).map(
            ([subCategory, badges]) => (
              <div key={subCategory} className="mb-6">
                {/* Subcategory */}
                <p className="text-sm text-gray-500 mb-4">
                  {subCategory}
                </p>

                <div className="space-y-4">
                  {badges.map((badge, index) => {
                    console.log("Badge:", badge.name);
console.log("Level:", badge.level);
console.log("Description:", badge.description);

                    const details = getBadgeDetails(badge);

                    return (
                      <div
                        key={`${badge.badgeKey}-${index}`}
                        className="flex items-start gap-4"
                      >
                        {/* Badge icon */}
                        <img
                          src={getBadgeImage(badge.name)}
                          alt={badge.name}
                          className="h-12 w-12 rounded-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/images/badges/default.png";
                          }}
                        />

                        {/* Badge text */}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {badge.name}
                            {badge.level && (
                              <span
                                className={`ml-2 text-xs font-normal ${
                                  badge.level === "Advanced"
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                }`}
                              >
                                ({badge.level})
                              </span>
                            )}
                          </p>

                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-600">
                              Categorys:
                            </span>{" "}
                            {badge.category}
                          </p>

                          {details && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-600">
                                Details:
                              </span>{" "}
                              {details}
                            </p>
                          )}

                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default BadgesList;
