import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };

    loadProfile();
  }, []);

  return (
    <div style={styles.page}>

      <p style={styles.eyebrow}>
        ACCOUNT
      </p>

      <h1>Profile</h1>

      {profile && (
        <div style={styles.card}>

          <div>
            <span>Name{" - "}</span>
            <strong>
              {profile.full_name || "Not set"}
            </strong>
          </div>

          <div>
            <span>Email{" - "}</span>
            <strong>
              {profile.email}
            </strong>
          </div>

          <div>
            <span>Role{" - "}</span>
            <strong>
              {profile.role}
            </strong>
          </div>

          <div>
            <span>Charity Contribution{" - "}</span>
            <strong>
              {profile.charity_percentage || 10}%
            </strong>
          </div>

        </div>
      )}

    </div>
  );
};

const styles = {
  page: {
    padding: "35px",
    color: "#fff",
  },

  eyebrow: {
    color: "#a3e635",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
  },

  card: {
    maxWidth: "650px",
    marginTop: "30px",
    background: "#111313",
    border: "1px solid #252727",
    borderRadius: "18px",
    padding: "25px",
    display: "grid",
    gap: "22px",
  },

  card: {
    maxWidth: "650px",
    marginTop: "30px",
    background: "#111313",
    border: "1px solid #252727",
    borderRadius: "18px",
    padding: "25px",
    display: "grid",
    gap: "22px",
  },
};

export default Profile;