import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const Charities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCharities = async () => {
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setCharities(data || []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCharity = async (charity) => {
    try {
      const { error } = await supabase
        .from("charities")
        .update({
          active: !charity.active,
        })
        .eq("id", charity.id);

      if (error) throw error;

      await loadCharities();
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    loadCharities();
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        Loading charities...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            ADMIN PANEL
          </p>

          <h1>Charities</h1>

          <p style={styles.subtitle}>
            Manage charities available to subscribers.
          </p>
        </div>
      </div>

      <div style={styles.grid}>

        {charities.map((charity) => (
          <div
            key={charity.id}
            style={styles.card}
          >

            {charity.image_url && (
              <img
                src={charity.image_url}
                alt={charity.name}
                style={styles.image}
              />
            )}

            <div style={styles.cardBody}>

              <div style={styles.cardTop}>
                <h2>{charity.name}</h2>

                <span
                  style={{
                    ...styles.status,
                    ...(charity.active
                      ? styles.active
                      : styles.inactive),
                  }}
                >
                  {charity.active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <p style={styles.description}>
                {charity.description ||
                  "No description available."}
              </p>

              <div style={styles.meta}>
                {charity.category || "General"}
              </div>

              <button
                style={
                  charity.active
                    ? styles.disable
                    : styles.enable
                }
                onClick={() =>
                  toggleCharity(charity)
                }
              >
                {charity.active
                  ? "Disable"
                  : "Enable"}
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "35px",
    background: "#080909",
    color: "#fff",
  },

  center: {
    minHeight: "80vh",
    display: "grid",
    placeItems: "center",
    background: "#080909",
    color: "#fff",
  },

  header: {
    marginBottom: "30px",
  },

  eyebrow: {
    color: "#a3e635",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
  },

  subtitle: {
    color: "#888",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#111313",
    border: "1px solid #252727",
    borderRadius: "18px",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
  },

  cardBody: {
    padding: "20px",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },

  description: {
    color: "#888",
    lineHeight: 1.5,
  },

  meta: {
    display: "inline-block",
    background: "#202222",
    color: "#aaa",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "11px",
  },

  status: {
    fontSize: "11px",
    padding: "5px 9px",
    borderRadius: "20px",
  },

  active: {
    background: "#243514",
    color: "#a3e635",
  },

  inactive: {
    background: "#302020",
    color: "#ff7777",
  },

  disable: {
    marginTop: "18px",
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #5a3030",
    background: "#251919",
    color: "#ff7777",
    cursor: "pointer",
  },

  enable: {
    marginTop: "18px",
    padding: "9px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#a3e635",
    color: "#111",
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Charities;