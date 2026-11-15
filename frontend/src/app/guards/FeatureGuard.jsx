import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import adminService from "@/services/adminService";
import { PageSkeleton } from "@/shared/patterns/page-skeleton";

/**
 * Guards a route based on feature flags. Fails closed: if the public config
 * cannot be loaded, the feature is treated as disabled.
 */
export default function FeatureGuard({ featureKey, children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const checkFeature = async () => {
      try {
        const config = await adminService.getPublicConfig();
        const features = config.features || {};
        setAllowed(features[featureKey] !== false);
      } catch {
        setAllowed(false);
      }
    };

    checkFeature();
  }, [featureKey]);

  if (allowed === null) {
    return (
      <PageSkeleton
        panels={1}
        rows={3}
        withActions={false}
        label="Checking feature availability"
      />
    );
  }

  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
