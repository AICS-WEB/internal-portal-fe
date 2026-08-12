import { hasRole } from "../utils/permissions.js";

export default function RoleGuard({ user, minRole = "member", fallback = null, children }) {
  if (!hasRole(user, minRole)) return fallback;
  return children;
}
