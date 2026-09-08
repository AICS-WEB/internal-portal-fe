import { formatLabel } from "../utils/format.js";

const toneMap = {
  important: "danger",
  pending: "warning",
  approved: "success",
  accepted: "success",
  published: "success",
  present: "success",
  active: "success",
  delivered: "success",
  rejected: "danger",
  deactivated: "muted",
  absent: "danger",
  closed: "muted",
  watch: "warning",
  purchased: "primary",
  manager: "primary",
  admin: "danger",
  deadline: "warning",
  trip: "primary",
  shared: "primary",
  private: "muted",
};

export default function Badge({ value, children, tone }) {
  const key = String(value || "").toLowerCase();
  const badgeTone = tone || toneMap[key] || "neutral";

  return <span className={`badge badge-${badgeTone}`}>{children || formatLabel(value)}</span>;
}
