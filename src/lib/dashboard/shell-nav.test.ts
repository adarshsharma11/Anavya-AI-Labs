import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAppShellBackLink, isAdminSection, isNavActive } from "./shell-nav";

describe("app shell navigation", () => {
  it("treats admin routes as the admin section", () => {
    assert.equal(isAdminSection("/admin/reviews"), true);
    assert.equal(isAdminSection("/dashboard/admin/blogs"), true);
    assert.equal(isAdminSection("/dashboard"), false);
    assert.equal(isAdminSection("/dashboard/scans"), false);
  });

  it("keeps overview active only on the dashboard root", () => {
    assert.equal(isNavActive("/dashboard", "/dashboard"), true);
    assert.equal(isNavActive("/dashboard/scans", "/dashboard"), false);
    assert.equal(isNavActive("/dashboard/admin/blogs", "/dashboard/admin/blogs"), true);
  });

  it("returns a contextual back link", () => {
    assert.deepEqual(getAppShellBackLink("/dashboard"), {
      href: "/",
      label: "Back to site",
    });
    assert.deepEqual(getAppShellBackLink("/admin/reviews"), {
      href: "/dashboard",
      label: "Back to dashboard",
    });
    assert.deepEqual(getAppShellBackLink("/dashboard/admin/users"), {
      href: "/dashboard",
      label: "Back to dashboard",
    });
  });
});
