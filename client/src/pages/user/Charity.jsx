import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Heart,
  Search,
  Sparkles,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

import Card from "../../components/Card/Card";
import Loader from "../../components/Loader/Loader";

import "./Charity.css";

function Charity() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [charities, setCharities] = useState([]);
  const [subscription, setSubscription] = useState(null);

  const [search, setSearch] = useState("");
  const [charityPercentage, setCharityPercentage] =
    useState(10);

  const [selectedCharityId, setSelectedCharityId] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [savingCharity, setSavingCharity] = useState(false);
  const [savingPercentage, setSavingPercentage] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCharityData();
  }, []);

  async function loadCharityData() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be logged in.");
      }

      setUser(user);

      // Profile
      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            selected_charity_id,
            charity_percentage
          `)
          .eq("id", user.id)
          .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      setSelectedCharityId(
        profileData.selected_charity_id || null
      );

      setCharityPercentage(
        profileData.charity_percentage || 10
      );

      // Active charities
      const {
        data: charityData,
        error: charityError,
      } = await supabase
        .from("charities")
        .select(`
          id,
          name,
          description,
          image_url,
          active
        `)
        .eq("active", true)
        .order("name", { ascending: true });

      if (charityError) {
        throw charityError;
      }

      setCharities(charityData || []);

      // Latest subscription
      const {
        data: subscriptionData,
        error: subscriptionError,
      } = await supabase
        .from("subscriptions")
        .select(`
          id,
          status,
          subscription_plans (
            name,
            price,
            billing_interval
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error(
          "Subscription error:",
          subscriptionError
        );
      } else {
        setSubscription(subscriptionData);
      }
    } catch (err) {
      console.error("Charity page error:", err);

      setError(
        err.message || "Unable to load charity data."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCharities = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return charities;
    }

    return charities.filter((charity) => {
      return (
        charity.name?.toLowerCase().includes(query) ||
        charity.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [charities, search]);

  const selectedCharity = charities.find(
    (charity) => charity.id === selectedCharityId
  );

  const subscriptionPrice =
    subscription?.subscription_plans?.price || 0;

  const estimatedContribution =
    (Number(subscriptionPrice) *
      Number(charityPercentage)) /
    100;

  async function handleSelectCharity(charityId) {
    try {
      setSavingCharity(true);
      setError("");
      setSuccess("");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          selected_charity_id: charityId,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setSelectedCharityId(charityId);

      setProfile((previous) => ({
        ...previous,
        selected_charity_id: charityId,
      }));

      setSuccess("Your charity has been updated.");
    } catch (err) {
      console.error(
        "Select charity error:",
        err
      );

      setError(
        err.message || "Unable to update charity."
      );
    } finally {
      setSavingCharity(false);
    }
  }

  async function handlePercentageChange(value) {
    const percentage = Number(value);

    if (percentage < 10 || percentage > 100) {
      return;
    }

    try {
      setSavingPercentage(true);
      setError("");
      setSuccess("");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          charity_percentage: percentage,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setCharityPercentage(percentage);

      setProfile((previous) => ({
        ...previous,
        charity_percentage: percentage,
      }));

      setSuccess(
        `Your charity contribution is now ${percentage}%.`
      );
    } catch (err) {
      console.error(
        "Percentage update error:",
        err
      );

      setError(
        err.message ||
        "Unable to update contribution percentage."
      );
    } finally {
      setSavingPercentage(false);
    }
  }

  if (loading) {
    return (
      <div className="charity-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="charity-page">

      {/* Header */}
      <header className="charity-page-header">

        <div>
          <span className="charity-eyebrow">
            YOUR IMPACT
          </span>

          <h1>
            Play with purpose.
          </h1>

          <p>
            Every subscription can support a cause you
            care about. Choose where your impact goes.
          </p>
        </div>

        <div className="charity-header-icon">
          <Heart size={30} />
        </div>

      </header>

      {/* Messages */}
      {error && (
        <div className="charity-message charity-error">
          {error}
        </div>
      )}

      {success && (
        <div className="charity-message charity-success">
          <Check size={17} />
          {success}
        </div>
      )}

      {/* Current Impact */}
      <section className="charity-impact-grid">

        <Card className="current-charity-card">

          <div className="card-label">
            CURRENT CHARITY
          </div>

          {selectedCharity ? (
            <div className="current-charity-content">

              {selectedCharity.image_url ? (
                <img
                  src={selectedCharity.image_url}
                  alt={selectedCharity.name}
                  className="current-charity-logo"
                />
              ) : (
                <div className="current-charity-icon">
                  <Heart size={25} />
                </div>
              )}

              <div>
                <h2>
                  {selectedCharity.name}
                </h2>

                <p>
                  {selectedCharity.description ||
                    "Your chosen charity partner."}
                </p>
              </div>

            </div>
          ) : (
            <div className="no-charity-selected">
              <Heart size={28} />

              <h2>
                No charity selected
              </h2>

              <p>
                Choose a charity below to start directing
                your contribution.
              </p>
            </div>
          )}

        </Card>

        <Card className="contribution-card">

          <div className="card-label">
            YOUR CONTRIBUTION
          </div>

          <div className="contribution-value">
            {charityPercentage}%
          </div>

          <p>
            of your subscription goes towards your
            selected charity.
          </p>

          {subscriptionPrice > 0 && (
            <div className="estimated-contribution">
              <span>Estimated per billing cycle</span>

              <strong>
                ₹{estimatedContribution.toFixed(2)}
              </strong>
            </div>
          )}

        </Card>

      </section>

      {/* Contribution Control */}
      <Card className="contribution-control-card">

        <div className="control-heading">
          <div>
            <span className="charity-eyebrow">
              CONTRIBUTION
            </span>

            <h2>
              Choose your impact level
            </h2>

            <p>
              The minimum contribution is 10%. You can
              increase it whenever you want.
            </p>
          </div>

          <div className="percentage-display">
            {charityPercentage}%
          </div>
        </div>

        <div className="range-wrapper">

          <div className="range-labels">
            <span>10%</span>
            <span>100%</span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={charityPercentage}
            onChange={(event) =>
              setCharityPercentage(
                Number(event.target.value)
              )
            }
            onMouseUp={(event) =>
              handlePercentageChange(
                event.target.value
              )
            }
            onTouchEnd={(event) =>
              handlePercentageChange(
                event.target.value
              )
            }
            disabled={savingPercentage}
            className="charity-range"
          />

          <div className="range-current">
            {savingPercentage
              ? "Saving..."
              : `Currently contributing ${charityPercentage}%`}
          </div>

        </div>

      </Card>

      {/* Charity Directory */}
      <section className="charity-directory">

        <div className="directory-header">

          <div>
            <span className="charity-eyebrow">
              CHARITY DIRECTORY
            </span>

            <h2>
              Choose your charity
            </h2>

            <p>
              Select the organisation you want your
              contribution to support.
            </p>
          </div>

          <div className="charity-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search charities..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

        </div>

        {filteredCharities.length === 0 ? (
          <div className="charity-empty">
            <Search size={28} />

            <h3>
              No charities found
            </h3>

            <p>
              Try searching with another name or keyword.
            </p>
          </div>
        ) : (
          <div className="charity-grid">

            {filteredCharities.map((charity) => {
              const isSelected =
                charity.id === selectedCharityId;

              return (
                <Card
                  key={charity.id}
                  className={`charity-option-card ${isSelected
                      ? "charity-option-selected"
                      : ""
                    }`}
                >

                  <div className="charity-option-top">

                    {charity.image_url ? (
                      <img
                        src={charity.image_url}
                        alt={charity.name}
                        className="charity-option-logo"
                      />
                    ) : (
                      <div className="charity-option-icon">
                        <Heart size={24} />
                      </div>
                    )}

                    {isSelected && (
                      <span className="selected-check">
                        <Check size={15} />
                      </span>
                    )}

                  </div>

                  <h3>
                    {charity.name}
                  </h3>

                  <p>
                    {charity.description ||
                      "Support this cause through your subscription."}
                  </p>

                  <button
                    type="button"
                    disabled={
                      isSelected || savingCharity
                    }
                    className={
                      isSelected
                        ? "selected-charity-btn"
                        : "select-charity-btn"
                    }
                    onClick={() =>
                      handleSelectCharity(charity.id)
                    }
                  >
                    {isSelected ? (
                      <>
                        <Check size={17} />
                        Selected
                      </>
                    ) : savingCharity ? (
                      "Saving..."
                    ) : (
                      <>
                        <Heart size={17} />
                        Select Charity
                      </>
                    )}
                  </button>

                </Card>
              );
            })}

          </div>
        )}

      </section>

      {/* Bottom message */}
      <div className="charity-purpose-banner">

        <div className="purpose-icon">
          <Sparkles size={23} />
        </div>

        <div>
          <strong>
            Your game can create real impact.
          </strong>

          <p>
            Every contribution helps support the cause
            you choose while you enjoy the game.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Charity;