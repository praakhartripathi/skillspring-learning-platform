export const redirectByRole = (role?: string | null): string => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "instructor":
      return "/instructor/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      // Redirect to the home page if role is unknown or null
      return "/";
  }
};