export function isAdminSection(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin");
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAppShellBackLink(pathname: string) {
  if (isAdminSection(pathname)) {
    return { href: "/dashboard", label: "Back to dashboard" };
  }
  return { href: "/", label: "Back to site" };
}
