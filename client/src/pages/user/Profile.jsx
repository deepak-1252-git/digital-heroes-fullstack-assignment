import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Save,
  Lock,
  Heart,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

import Card from "../../components/Card/Card";
import Loader from "../../components/Loader/Loader";

import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [charities, setCharities] = useState([]);

  const [fullName, setFullName] = useState("");
  const [charityId, setCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState(10);

  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        throw new Error("Please login first.");
      }

      setUser(currentUser);

      // -----------------------------
      // Profile
      // -----------------------------

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email,
            role,
            selected_charity_id,
            charity_percentage
          `)
          .eq("id", currentUser.id)
          .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      setFullName(profileData.full_name || "");
      setCharityId(profileData.selected_charity_id || "");
      setCharityPercentage(
        profileData.charity_percentage || 10
      );

      // -----------------------------
      // Charities
      // -----------------------------

      const {
        data: charityData,
        error: charityError,
      } = await supabase
        .from("charities")
        .select(`
          id,
          name,
          description
        `)
        .eq("active", true)
        .order("name");

      if (charityError) {
        throw charityError;
      }

      setCharities(charityData || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // --------------------------------
  // Save Profile
  // --------------------------------

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      if (!fullName.trim()) {
        throw new Error("Full name is required.");
      }

      if (!charityId) {
        throw new Error("Please select a charity.");
      }

      const percentage = Number(charityPercentage);

      if (percentage < 10 || percentage > 100) {
        throw new Error(
          "Charity contribution must be between 10% and 100%."
        );
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          selected_charity_id: charityId,
          charity_percentage: percentage,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setProfile((previous) => ({
        ...previous,
        full_name: fullName.trim(),
        selected_charity_id: charityId,
        charity_percentage: percentage,
      }));

      setSuccess(
        "Profile and charity settings saved successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to save profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // --------------------------------
  // Change Password
  // --------------------------------

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    try {
      setSavingPassword(true);
      setError("");
      setSuccess("");

      if (newPassword.length < 6) {
        throw new Error(
          "Password must be at least 8 characters."
        );
      }

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (passwordError) {
        throw passwordError;
      }

      setNewPassword("");

      setSuccess(
        "Password updated successfully."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* HEADER */}

      <div className="profile-header">
        <span className="page-eyebrow">
          Account
        </span>

        <h1>Profile & Settings</h1>

        <p>
          Manage your personal information, charity
          contribution and account security.
        </p>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="profile-message error">
          <AlertCircle size={18} />

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="profile-message success">
          <CheckCircle2 size={18} />

          <span>{success}</span>
        </div>
      )}

      <div className="profile-grid">

        {/* -------------------------------- */}
        {/* PERSONAL INFORMATION */}
        {/* -------------------------------- */}

        <Card className="profile-card">

          <div className="profile-card-header">

            <div className="profile-card-icon">
              <User size={21} />
            </div>

            <div>
              <h2>Personal Information</h2>

              <p>
                Update the information associated
                with your account.
              </p>
            </div>

          </div>

          <form onSubmit={handleSaveProfile}>

            {/* NAME */}

            <div className="profile-field">

              <label htmlFor="fullName">
                Full Name
              </label>

              <div className="profile-input">

                <User size={17} />

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Your full name"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="profile-field">

              <label htmlFor="email">
                Email
              </label>

              <div className="profile-input disabled">

                <Mail size={17} />

                <input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />

              </div>

              <small>
                Email is managed through your
                authentication account.
              </small>

            </div>

            {/* ROLE */}

            <div className="profile-field">

              <label>
                Account Type
              </label>

              <div className="profile-role">
                {profile?.role || "subscriber"}
              </div>

            </div>

            {/* SAVE */}

            <button
              type="submit"
              className="profile-save-button"
              disabled={savingProfile}
            >
              <Save size={17} />

              {savingProfile
                ? "Saving..."
                : "Save Profile"}
            </button>

          </form>

        </Card>

        {/* -------------------------------- */}
        {/* CHARITY SETTINGS */}
        {/* -------------------------------- */}

        <Card className="profile-card">

          <div className="profile-card-header">

            <div className="profile-card-icon">
              <Heart size={21} />
            </div>

            <div>
              <h2>Charity Settings</h2>

              <p>
                Choose your cause and decide how
                much of your subscription goes toward it.
              </p>
            </div>

          </div>

          <form onSubmit={handleSaveProfile}>

            {/* CHARITY */}

            <div className="profile-field">

              <label htmlFor="charity">
                Selected Charity
              </label>

              <select
                id="charity"
                value={charityId}
                onChange={(event) =>
                  setCharityId(event.target.value)
                }
              >
                <option value="">
                  Select a charity
                </option>

                {charities.map((charity) => (
                  <option
                    key={charity.id}
                    value={charity.id}
                  >
                    {charity.name}
                  </option>
                ))}
              </select>

            </div>

            {/* PERCENTAGE */}

            <div className="profile-field">

              <div className="percentage-heading">

                <label htmlFor="charityPercentage">
                  Charity Contribution
                </label>

                <strong>
                  {charityPercentage}%
                </strong>

              </div>

              <input
                id="charityPercentage"
                className="percentage-range"
                type="range"
                min="10"
                max="100"
                step="1"
                value={charityPercentage}
                onChange={(event) =>
                  setCharityPercentage(
                    Number(event.target.value)
                  )
                }
              />

              <div className="percentage-labels">
                <span>10% minimum</span>
                <span>100%</span>
              </div>

              <p className="field-description">
                You can contribute more than the
                minimum 10% if you choose.
              </p>

            </div>

            {/* PREVIEW */}

            <div className="charity-preview">

              <Heart size={20} />

              <div>
                <strong>
                  {charityPercentage}% contribution
                </strong>

                <span>
                  to{" "}
                  {charities.find(
                    (charity) =>
                      charity.id === charityId
                  )?.name || "your selected charity"}
                </span>
              </div>

            </div>

            <button
              type="submit"
              className="profile-save-button"
              disabled={savingProfile}
            >
              <Save size={17} />

              {savingProfile
                ? "Saving..."
                : "Save Charity Settings"}
            </button>

          </form>

        </Card>

        {/* -------------------------------- */}
        {/* SECURITY */}
        {/* -------------------------------- */}

        <Card className="profile-card security-card">

          <div className="profile-card-header">

            <div className="profile-card-icon">
              <Lock size={21} />
            </div>

            <div>
              <h2>Security</h2>

              <p>
                Keep your account secure with a
                strong password.
              </p>
            </div>

          </div>

          <form onSubmit={handlePasswordChange}>

            <div className="profile-field">

              <label htmlFor="newPassword">
                New Password
              </label>

              <div className="profile-input">

                <Lock size={17} />

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  minLength={8}
                />

              </div>

              <small>
                Use at least 8 characters.
              </small>

            </div>

            <button
              type="submit"
              className="profile-save-button"
              disabled={savingPassword}
            >
              <Lock size={17} />

              {savingPassword
                ? "Updating..."
                : "Update Password"}
            </button>

          </form>

        </Card>

      </div>
    </div>
  );
};

export default Profile;