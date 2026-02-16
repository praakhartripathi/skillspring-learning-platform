export const redirectByRole = (role?: string | null): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "instructor":
      return "/instructor";
    case "student":
      return "/student";
    default:
      // Redirect to the home page if role is unknown or null
      return "/";
  }
};