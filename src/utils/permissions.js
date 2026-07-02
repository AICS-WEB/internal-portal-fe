const roleWeight = {
  member: 1,
  manager: 2,
  admin: 3,
};

export function hasRole(user, requiredRole = "member") {
  const userRole = roleWeight[user?.role] || 0;
  const required = roleWeight[requiredRole] || 0;
  return userRole >= required;
}

export function canAccess(user, item) {
  return hasRole(user, item?.min_role || "member");
}
