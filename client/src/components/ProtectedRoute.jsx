import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const API_URL = import.meta.env.VITE_API_URL;

const ProtectedRoute = ({
  children,
  requireSubscription = false,
}) => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      try {
        setLoading(true);

        // -----------------------------
        // 1. GET CURRENT USER
        // -----------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setSubscription(null);
            setLoading(false);
          }

          return;
        }

        if (!mounted) return;

        setUser(user);

        // -----------------------------
        // 2. GET PROFILE + ROLE
        // -----------------------------

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, role, full_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error(
            "Profile fetch error:",
            profileError
          );
        }

        if (!mounted) return;

        setProfile(profileData);

        // -----------------------------
        // 3. ADMIN BYPASS
        // -----------------------------

        if (profileData?.role === "admin") {
          setLoading(false);
          return;
        }

        // -----------------------------
        // 4. SUBSCRIPTION CHECK
        // -----------------------------

        if (requireSubscription) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            if (mounted) {
              setUser(null);
              setLoading(false);
            }

            return;
          }

          const response = await fetch(
            `${API_URL}/api/subscriptions/me`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const result = await response.json();

          if (!response.ok) {
            console.error(
              "Subscription API error:",
              result.message
            );

            if (mounted) {
              setSubscription(null);
            }
          } else {
            if (mounted) {
              setSubscription(
                result.subscription || null
              );
            }
          }
        }

        if (mounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error(
          "ProtectedRoute error:",
          error
        );

        if (mounted) {
          setSubscription(null);
          setLoading(false);
        }
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [requireSubscription]);

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="protected-route-loading">
        Checking access...
      </div>
    );
  }

  // -----------------------------
  // NOT LOGGED IN
  // -----------------------------

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // -----------------------------
  // ADMIN
  // -----------------------------

  if (profile?.role === "admin") {
    return children;
  }

  // -----------------------------
  // SUBSCRIPTION REQUIRED
  // -----------------------------

  if (
    requireSubscription &&
    !subscription
  ) {
    return (
      <Navigate
        to="/pricing"
        replace
        state={{
          from: location.pathname,
          message:
            "An active subscription is required to access this page.",
        }}
      />
    );
  }

  // -----------------------------
  // ACCESS GRANTED
  // -----------------------------

  return children;
};

export default ProtectedRoute;