export const isVerifiedCampaign = (item) => {
  if (!item) return false;
  // If explicitly unapproved (0) or rejected (2) or explicitly unverified (0)
  if (item.is_approved === 0 || item.is_approved === 2 || item.is_verified === 0) {
    return false;
  }
  return true;
};
