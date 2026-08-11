export type Role = "member" | "manager" | "admin";
export type User = Record<string, unknown> & { id?: string; name?: string; email?: string; role?: Role };
export type ApiError = Error & { status?: number; code?: string };

