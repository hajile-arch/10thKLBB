import React, { useMemo, useState } from "react";
import { Tooltip, TextField } from "@mui/material";
import { SelectedBadge } from "../../enum";

interface BadgesListProps {
  badges: SelectedBadge[];
}

type BadgeWithDescription = SelectedBadge & {
  description?:
    | string
    | {
        Basic?: string;
        Advanced?: string;
      };
};

/* ---------------------------
   IMAGE + DETAILS HELPERS
---------------------------- */

const getBadgeImage = (name: string) =>
  `/images/badges/${name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+$/, "")}.png`;

const getBadgeDetails = (badge: BadgeWithDescription): string | null => {
  if (!badge.description) return null;

  if (typeof badge.description === "string") return badge.description;

  if (badge.level === "Advanced" && badge.description.Advanced) {
    return badge.description.Advanced;
  }

  if (badge.level === "Basic" && badge.description.Basic) {
    return badge.description.Basic;
  }

  return badge.description.Basic ?? badge.description.Advanced ?? null;
};

/* ---------------------------
   LABEL FORMATTERS
---------------------------- */

const formatLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

const subCategoryLabels: Record<string, string> = {
  compulsory: "Compulsory",
  groupA: "Electives - Interest (Group A)",
  groupB: "Electives - Adventure (Group B)",
  groupC: "Electives - Community (Group C)",
  groupD: "Electives - Physical (Group D)",
};

const formatSubCategory = (key: string): string => {
  return subCategoryLabels[key] ?? formatLabel(key);
};

/* ---------------------------
   SORTING LOGIC
---------------------------- */

const sortBadges = (list: SelectedBadge[], category: string) => {
  const cat = category.toLowerCase();

  const getPriority = (b: SelectedBadge) => {
    const name = b.name.toLowerCase();

    if (cat.includes("special")) {
      if (name.includes("founder")) return 0;
      if (name.includes("president")) return 1;
      if (name.includes("nco proficiency star")) return 2;
      return 3;
    }

    if (cat.includes("compulsory") || cat.includes("proficiency")) {
      if (name.includes("target badge")) return 0;
      return 1;
    }

    return 0;
  };

  return [...list].sort((a, b) => getPriority(a) - getPriority(b));
};

/* ---------------------------
   COMPONENT
---------------------------- */

const BadgesList: React.FC<BadgesListProps> = ({ badges }) => {
  const [search, setSearch] = useState("");
  const [selectedBadge, setSelectedBadge] =
    useState<SelectedBadge | null>(null);

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  const filtered = useMemo(() => {
    return badges.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [badges, search]);

  const grouped = useMemo(() => {
    const grouped = filtered.reduce<
      Record<string, Record<string, SelectedBadge[]>>
    >((acc, badge) => {
      const category = badge.category || "Others";
      const subCategory = badge.subCategory || "General";

      if (!acc[category]) acc[category] = {};
      if (!acc[category][subCategory]) acc[category][subCategory] = [];

      acc[category][subCategory].push(badge);
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(grouped).map(([cat, subs]) => [
        cat,
        Object.fromEntries(
          Object.entries(subs).map(([sub, list]) => {
            const map = new Map<string, SelectedBadge>();

            list.forEach((b) => {
              const existing = map.get(b.badgeKey);
              if (!existing || b.level === "Advanced") {
                map.set(b.badgeKey, b);
              }
            });

            return [sub, Array.from(map.values())];
          })
        ),
      ])
    );
  }, [filtered]);

const BadgeWrapper = ({ children, title, badge }: any) => {
  if (isMobile) {
    return <div onClick={() => setSelectedBadge(badge)}>{children}</div>;
  }

  return (
    <Tooltip title={title || "No details"} arrow>
      <span style={{ display: "inline-block", width: "100%", height: "100%" }}>
        {children}
      </span>
    </Tooltip>
  );
};

  const BadgeModal = () => {
    if (!selectedBadge) return null;

    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
        onClick={() => setSelectedBadge(null)}
      >
        <div
          className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 items-center">
            <img
              src={getBadgeImage(selectedBadge.name)}
              className="h-12 w-12"
            />
            <div>
              <p className="font-semibold">{selectedBadge.name}</p>
              <p className="text-xs text-gray-500">
                {selectedBadge.level}
              </p>
            </div>
          </div>

          <p className="text-sm mt-3 text-gray-600">
            {getBadgeDetails(selectedBadge) || "No description available"}
          </p>

          <button
            className="mt-4 w-full py-2 bg-gray-900 text-white rounded-lg"
            onClick={() => setSelectedBadge(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  if (!badges || badges.length === 0) {
    return <p className="text-sm text-gray-500">No badges recorded.</p>;
  }

  return (
    <div className="space-y-6">

      {/* SEARCH (optional) */}
      {/* <TextField ... /> */}

      {Object.entries(grouped).map(([category, subCategories]) => (
        <div key={category} className="space-y-4">

          <div>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              {formatLabel(category)}
            </span>
          </div>

          {/* FLAT MODE */}
          {category.toLowerCase().includes("service") ||
          category.toLowerCase().includes("special") ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 auto-rows-fr">

              {sortBadges(Object.values(subCategories).flat(), category).map(
                (badge, index) => {
                  const details = getBadgeDetails(badge);

                  return (
                    <BadgeWrapper
                      key={`${badge.badgeKey}-${index}`}
                      title={details}
                      badge={badge}
                    >
                      <div className="group flex flex-col items-center justify-center text-center p-2 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer aspect-square w-full border bg-white">

                        <div className="relative h-14 w-14 flex items-center justify-center">
                          {badge.level === "Advanced" && (
                            <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 group-hover:opacity-30" />
                          )}

                          <img
                            src={getBadgeImage(badge.name)}
                            alt={badge.name}
                            className="relative h-12 w-12 object-contain transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>

                        <p className="mt-2 text-[11px] font-semibold text-gray-800 line-clamp-2">
                          {badge.name}
                        </p>

                      </div>
                    </BadgeWrapper>
                  );
                }
              )}
            </div>
          ) : (
            /* GROUPED MODE */
            Object.entries(subCategories).map(([subCategory, badges]) => (
              <div key={subCategory} className="space-y-2">

                <p className="text-xs text-gray-500">
                  {formatSubCategory(subCategory)}
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 auto-rows-fr">

                  {sortBadges(badges, category).map((badge, index) => {
                    const details = getBadgeDetails(badge);

                    return (
                      <BadgeWrapper
                        key={`${badge.badgeKey}-${index}`}
                        title={details}
                        badge={badge}
                      >
                        <div className="group flex flex-col items-center justify-center text-center p-3 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer aspect-square w-full border bg-white">

                          <div className="relative h-14 w-14 flex items-center justify-center">
                            {badge.level === "Advanced" && (
                              <div className="absolute inset-0 rounded-full bg-red-500" />
                            )}

                            <img
                              src={getBadgeImage(badge.name)}
                              alt={badge.name}
                              className="relative h-12 w-12 object-contain transition-transform duration-200 group-hover:scale-110"
                            />
                          </div>

                          <p className="mt-2 text-[12px] font-semibold text-gray-800 line-clamp-2">
                            {badge.name}
                          </p>

                        </div>
                      </BadgeWrapper>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          <BadgeModal />
        </div>
      ))}
    </div>
  );
};

export default BadgesList;