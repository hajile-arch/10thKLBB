import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { SelectedBadge } from "../../types";
import BadgeLevelModal from './BadgeLevelModal';
import { FaTrash } from "react-icons/fa";
import { ChevronLeft, Plus } from "lucide-react";

interface EditBadgeListProps {
  badges: SelectedBadge[];
  onDeleteBadge: (index: number) => void;
  onAddBadge: (badge: SelectedBadge) => void;
}

const EditBadgeList: React.FC<EditBadgeListProps> = ({ badges, onDeleteBadge, onAddBadge }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subcategoryBadges, setSubcategoryBadges] = useState<SelectedBadge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<SelectedBadge | null>(null);

  // Category display name mapping
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

  // Rest of the handlers remain the same
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
    const existingBadge = badges.find(
      (b) => b.name === badge.name && (b.level === "Basic" || b.level === "Advanced")
    );

    if (existingBadge) {
      const hasBasic = badges.some((b) => b.name === badge.name && b.level === "Basic");
      const hasAdvanced = badges.some((b) => b.name === badge.name && b.level === "Advanced");

      if (hasBasic && hasAdvanced) {
        alert(`You already have both Basic and Advanced levels for this badge.`);
        return;
      }
    }

    if (selectedCategory === "serviceAwards" || selectedCategory === "specialAwards") {
      onAddBadge({ ...badge, level: "Basic" });
    } else {
      setSelectedBadge(badge);
      setIsModalOpen(true);
    }
  };

  const handleLevelSelect = (level: "Basic" | "Advanced") => {
    if (selectedBadge) {
      const hasBasic = badges.some((b) => b.name === selectedBadge.name && b.level === "Basic");
      const hasAdvanced = badges.some((b) => b.name === selectedBadge.name && b.level === "Advanced");

      if ((hasBasic && level === "Basic") || (hasAdvanced && level === "Advanced")) {
        alert(`You already have the ${level} level for this badge.`);
        return;
      }

      onAddBadge({ ...selectedBadge, level });
      setIsModalOpen(false);
    }
  };

  // Group badges by category and subcategory
  const groupedBadges = badges.reduce((acc, badge) => {
    const category = badge.category || "Unknown";
    const subCategory = badge.subCategory || "Unknown";

    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subCategory]) {
      acc[category][subCategory] = [];
    }
    acc[category][subCategory].push(badge);

    return acc;
  }, {} as Record<string, Record<string, SelectedBadge[]>>);

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
                  <h5 className="text-md font-semibold mb-2 mt-5 text-white">{subcategoryDisplayNames[subcategory]||subcategory}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupedBadges[category][subcategory].map((badge, index) => (
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

      {/* Badge selection interface */}
      <div className="bg-gray-100 rounded-lg p-6">
        {!selectedCategory ? (
          <div>
            <h3 className="text-xl font-bold mb-4">Available Badge Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-semibold flex items-center justify-between">
                    {categoryDisplayNames[category] || category}
                    <Plus className="w-5 h-5 text-gray-500" />
                  </h4>
                </div>
              ))}
            </div>
          </div>
        ) : !selectedSubcategory ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Subcategories in {categoryDisplayNames[selectedCategory] || selectedCategory}
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSubcategories([]);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcategories.map((subcategory) => (
                  <div
                    key={subcategory}
                    onClick={() => handleSubcategorySelect(subcategory)}
                    className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <h4 className="text-lg font-semibold flex items-center justify-between">
                      {subcategory}
                      <Plus className="w-5 h-5 text-gray-500" />
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Badges in {selectedSubcategory}</h3>
              <button
                onClick={() => {
                  setSelectedSubcategory(null);
                  setSubcategoryBadges([]);
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subcategoryBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 rounded-md flex flex-col items-center justify-between text-center bg-white shadow-lg"
                    style={{ height: "150px", width: "150px" }}
                  >
                    <div className="flex flex-col justify-center items-center h-full">
                      <h4 className="font-semibold text-lg mb-4">{badge.name}</h4>
                      <button
                        onClick={() => handleAddBadge(badge)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add Badge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BadgeLevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLevel={handleLevelSelect}
      />
    </div>
  );
};

export default EditBadgeList;