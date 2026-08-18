// Maps a user's role to their landing route after login.
// Supports both 'admin' and 'super_admin'/'school_admin'
const ROLE_ROUTES = {
  admin: /app/admin,
  super_admin: /app/admin,
  school_admin: /app/admin,
  teacher: /app/teacher,
  student: /app/student,
  guardian: /app/guardian,
  accountant: /app/accountant,
};

export function getRouteForRole(role) {
  const normalizedRole = String(role || ).trim().toLowerCase();
  return ROLE_ROUTES[normalizedRole] || /unauthorized;
}
