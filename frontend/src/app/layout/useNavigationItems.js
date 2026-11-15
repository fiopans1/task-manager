import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NAVIGATION_ITEMS } from "@/app/layout/navItems";
import authService from "@/services/authService";
import adminService from "@/services/adminService";

/**
 * Navigation visibility is shared by the desktop top bar and the mobile sheet.
 * It owns the role check and feature-flag filtering so both surfaces agree.
 */
export function useNavigationItems() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({});
  const sessionUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    let active = true;

    authService
      .getRoles()
      .then((roles) => {
        if (active) setIsAdmin(Boolean(roles && roles.includes("ROLE_ADMIN")));
      })
      .catch((error) => console.error("Error checking admin status:", error));

    adminService
      .getPublicConfig()
      .then((config) => {
        if (active) setFeatureFlags(config.features || {});
      })
      .catch((error) => console.debug("Could not load feature flags:", error));

    return () => {
      active = false;
    };
  }, []);

  const items = NAVIGATION_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.featureKey && featureFlags[item.featureKey] === false) return false;
    return true;
  });

  return {
    items,
    isAdmin,
    displayName: sessionUser?.displayName || sessionUser?.username || "Account",
  };
}
