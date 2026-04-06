// utils/badgeUtils.ts
import { Badge } from "../types";

// This simulates fetching fresh badge data from your master list
const fetchFreshBadgeData = async (badgeKey: string): Promise<Badge | null> => {
  try {
    // Replace this with your actual API call to get badge by badgeKey
    const response = await fetch(`/api/badges/${badgeKey}`);
    if (!response.ok) throw new Error("Failed to fetch badge");
    return await response.json();
  } catch (error) {
    console.error("Error fetching fresh badge data:", error);
    return null;
  }
};

// Use local cache to avoid too many API calls
const badgeCache = new Map<string, Badge>();

export const getFreshBadgeData = async (userBadge: Badge): Promise<Badge> => {
  // If no badgeKey, can't fetch fresh data
  if (!userBadge.badgeKey) {
    return userBadge;
  }

  // Check cache first
  if (badgeCache.has(userBadge.badgeKey)) {
    const cachedBadge = badgeCache.get(userBadge.badgeKey)!;
    return {
      ...userBadge,
      description: cachedBadge.description, // Use fresh description
      iconUrl: cachedBadge.iconUrl || userBadge.iconUrl,
      // Add other fields you want to sync
    };
  }

  // Fetch fresh data
  const freshBadge = await fetchFreshBadgeData(userBadge.badgeKey);
  if (freshBadge) {
    // Cache it
    badgeCache.set(userBadge.badgeKey, freshBadge);
    
    // Return merged badge with fresh data
    return {
      ...userBadge,
      description: freshBadge.description, // Use fresh description
      iconUrl: freshBadge.iconUrl || userBadge.iconUrl,
      points: freshBadge.points || userBadge.points,
    };
  }

  // If fetch fails, use the user's badge data
  return userBadge;
};