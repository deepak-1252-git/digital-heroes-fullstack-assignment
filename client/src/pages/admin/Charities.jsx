import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Charities.css";

const Charities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCharities = async () => {
    try {
      setError("");

      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setCharities(data || []);
    } catch (error) {
      console.error("Load charities error:", error);
      setError(
        error.message || "Failed to load charities."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCharity = async (charity) => {
    try {
      setUpdatingId(charity.id);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("charities")
        .update({
          active: !charity.active,
        })
        .eq("id", charity.id);

      if (error) throw error;

      setCharities((currentCharities) =>
        currentCharities.map((item) =>
          item.id === charity.id
            ? {
                ...item,
                active: !charity.active,
              }
            : item
        )
      );

      setSuccess(
        `${charity.name} ${
          charity.active ? "disabled" : "enabled"
        } successfully.`
      );
    } catch (error) {
      console.error("Toggle charity error:", error);

      setError(
        error.message ||
          "Failed to update charity status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadCharities();
  }, []);

  if (loading) {
    return (
      <div className="charities-loading">
        <div className="charities-loader"></div>
        <p>Loading charities...</p>
      </div>
    );
  }

  return (
    <div className="charities-page">

      <div className="charities-container">

        {/* Header */}
        <div className="charities-header">

          <div>
            <p className="charities-eyebrow">
              ADMIN PANEL
            </p>

            <h1>
              Charities
            </h1>

            <p className="charities-subtitle">
              Manage charities available to subscribers.
            </p>
          </div>

          <div className="charities-count">
            <span>Total</span>
            <strong>{charities.length}</strong>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="charities-alert charities-alert-error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="charities-alert charities-alert-success">
            {success}
          </div>
        )}

        {/* Empty */}
        {charities.length === 0 ? (
          <div className="charities-empty">
            <h2>No charities found</h2>

            <p>
              There are currently no charities available.
            </p>
          </div>
        ) : (
          <div className="charities-grid">

            {charities.map((charity) => (
              <div
                key={charity.id}
                className="charity-card"
              >

                {/* Image */}
                {charity.image_url ? (
                  <div className="charity-image-wrapper">
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="charity-image"
                    />
                  </div>
                ) : (
                  <div className="charity-image-placeholder">
                    <span>
                      {charity.name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </span>
                  </div>
                )}

                {/* Body */}
                <div className="charity-card-body">

                  <div className="charity-card-top">

                    <h2>
                      {charity.name}
                    </h2>

                    <span
                      className={`charity-status ${
                        charity.active
                          ? "charity-status-active"
                          : "charity-status-inactive"
                      }`}
                    >
                      {charity.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  <p className="charity-description">
                    {charity.description ||
                      "No description available."}
                  </p>

                  <div className="charity-meta">
                    {charity.category || "General"}
                  </div>

                  <button
                    type="button"
                    disabled={
                      updatingId === charity.id
                    }
                    className={`charity-toggle-btn ${
                      charity.active
                        ? "charity-disable-btn"
                        : "charity-enable-btn"
                    }`}
                    onClick={() =>
                      toggleCharity(charity)
                    }
                  >
                    {updatingId === charity.id
                      ? "Updating..."
                      : charity.active
                      ? "Disable Charity"
                      : "Enable Charity"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Charities;