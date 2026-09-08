const roleWeight = {
  member: 1,
  manager: 2,
  admin: 3,
};

export function hasRole(user, requiredRole = "member") {
  const userRole = roleWeight[String(user?.role || "").toLowerCase()] || 0;
  const required = roleWeight[String(requiredRole || "").toLowerCase()] || 0;
  return userRole >= required;
}

export function canAccess(user, item) {
  return hasRole(user, item?.min_role || "member");
}

export function isContentOwner(user, item) {
  if (!user || !item) return false;
  const userId = Number(user.id);
  const ownerId = Number(item.user_id ?? item.owner_id ?? item.created_by ?? item.author_id);
  if (Number.isFinite(userId) && Number.isFinite(ownerId) && userId === ownerId) return true;
  if (item.owner && item.owner === user.name) return true;
  if (item.author && item.author === user.name) return true;
  return (item.authors || []).some((author) => Number(author.user_id ?? author.userId) === userId);
}

export function canManageContent(user, item) {
  return hasRole(user, "manager") || isContentOwner(user, item);
}
