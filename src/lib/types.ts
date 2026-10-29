// Mirror of the backend /admin/* response shapes.

export type AdminMe = {
  id: string | null;
  email: string | null;
  name: string | null;
  /** "superadmin" for a session, "token" for ADMIN_TOKEN. */
  appRole: "superadmin" | "token";
};

export type Page<T> = { items: T[]; page: number; pageSize: number; total: number };

export type TripState = "upcoming" | "open" | "ended" | "revealed";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  appRole: "user" | "superadmin";
  badge: Badge | null;
  createdAt: number;
  lastSeenAt: number | null;
  tripCount: number;
  mediaCount: number;
};

export type Badge = "founder" | "first_edition";

export type AdminUserDetail = AdminUser & {
  bio: string | null;
  unlimitedRollos: boolean;
  trips: { id: string; name: string; role: "admin" | "member"; state: TripState }[];
};

export type Metric =
  | "users_total" | "users_new" | "trips_total" | "trips_new" | "trips_open"
  | "trips_revealed_total" | "media_total" | "media_new" | "storage_bytes" | "active_users";

export type MetricsResponse = {
  latestDay: string | null;
  series: { day: string; values: Partial<Record<Metric, number>> }[];
};

export type UsageMetric = "workers_requests" | "d1_rows_read" | "d1_rows_written" | "r2_class_a" | "r2_class_b";

export type UsageResponse = {
  usage: null | { fetchedAt: number; values: Record<UsageMetric, number>; limits: Record<UsageMetric, number> };
  storage: { usedBytes: number; limitBytes: number };
};

export type DegradedMode = {
  on: boolean;
  updatedAt: number | null;
  updatedBy: { id: string; email: string } | null;
};
