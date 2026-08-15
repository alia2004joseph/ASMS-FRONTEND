// Maps a user's role to their landing route after login.
// Super Administrator and School Administrator both land on /app/admin;
// adjust here if they should diverge later.

const ROLE_ROUTES = {
  super_admin: "/app/admin",
  school_admin: "/app/admin",
  teacher: "/app/teacher",
  student: "/app/student",
  guardian: "/app/guardian",
  accountant: "/app/accountant",
};

export function getRouteForRole(role) {
  return ROLE_ROUTES[role] || "/unauthorized";
}
