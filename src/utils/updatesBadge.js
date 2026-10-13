const STORAGE_KEY_PREFIX = "blimp_seen_updates_";

/**
 * Get the number of updates the current user has already "seen"
 * for a given campaign (stored in localStorage).
 * @param {string|number} campaignId
 * @returns {number}
 */
export const getSeenCount = (campaignId) => {
  if (!campaignId) return 0;
  return (
    Number(localStorage.getItem(`${STORAGE_KEY_PREFIX}${campaignId}`)) || 0
  );
};

/**
 * Persist the current total update count as "seen" for the campaign.
 * Call this when a logged-in user opens the Updates tab.
 * @param {string|number} campaignId
 * @param {number} totalCount
 */
export const markUpdatesSeen = (campaignId, totalCount) => {
  if (!campaignId) return;
  localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${campaignId}`,
    String(totalCount)
  );
};
