import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import adminService from "@/services/adminService";
import { Spinner } from "@/shared/ui/spinner";

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
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={22} />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
