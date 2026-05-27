import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import adminService from "../../services/adminService";
import { Container, Spinner } from "react-bootstrap";

/**
 * Guards a route based on feature flags.
 * If the feature is disabled, redirects to /home.
 */
const FeatureGuard = ({ featureKey, children }) => {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const checkFeature = async () => {
      try {
        const config = await adminService.getPublicConfig();
        const features = config.features || {};
        // Feature is allowed unless explicitly disabled (false)
        setAllowed(features[featureKey] !== false);
      } catch (error) {
        // If config can't be loaded, deny access (fail closed)
        setAllowed(false);
      }
    };
    checkFeature();
  }, [featureKey]);

  if (allowed === null) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default FeatureGuard;
