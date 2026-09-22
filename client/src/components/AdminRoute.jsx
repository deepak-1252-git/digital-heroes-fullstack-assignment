import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError) {
        console.error("Admin role check error:", profileError);
      }

      if (!mounted) return;

      setUser(user);
      setIsAdmin(profile?.role === "admin");
      setLoading(false);
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="protected-route-loading">
        Checking access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;