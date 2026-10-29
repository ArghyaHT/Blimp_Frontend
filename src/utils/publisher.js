// Returns publisher info for a campaign: { label, name } or null.
// account_type: 1 => Individual, 2 => Organization
export const getPublisher = (campaign) => {
  const user = campaign?.campaigns || campaign?.user;
  const name = user?.fullname?.trim();
  if (!name) return null;
  const isOrg = Number(user?.account_type) === 2;
  return { name, type: isOrg ? "Organization" : "Individual" };
};
