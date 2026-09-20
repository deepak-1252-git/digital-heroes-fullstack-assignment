import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Check, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Charity() {
  const [charities, setCharities] = useState([]);
  const [profile, setProfile] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [selectedCharity, setSelectedCharity] = useState("");
  const [percentage, setPercentage] = useState(10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCharityData();
  }, []);

  const loadCharityData = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User session not found.");
      setLoading(false);
      return;
    }

    // Get active charities
    const { data: charityData, error: charityError } =
      await supabase
        .from("charities")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("name", { ascending: true });

    if (charityError) {
      setError(charityError.message);
      setLoading(false);
      return;
    }

    // Get user's profile
    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, selected_charity_id, charity_percentage")
        .eq("id", user.id)
        .single();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setCharities(charityData || []);
    setProfile(profileData);

    setSelectedCharity(profileData?.selected_charity_id || "");
    setPercentage(profileData?.charity_percentage || 10);

    setLoading(false);
  };

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        charities
          .map((charity) => charity.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [charities]);

  const filteredCharities = useMemo(() => {
    return charities.filter((charity) => {
      const matchesSearch =
        charity.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        charity.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        charity.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [charities, search, category]);

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (!selectedCharity) {
      setError("Please select a charity.");
      return;
    }

    const numericPercentage = Number(percentage);

    if (
      numericPercentage < 10 ||
      numericPercentage > 100
    ) {
      setError(
        "Charity contribution must be between 10% and 100%."
      );
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User session not found.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        selected_charity_id: selectedCharity,
        charity_percentage: numericPercentage,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setProfile((prev) => ({
      ...prev,
      selected_charity_id: selectedCharity,
      charity_percentage: numericPercentage,
    }));

    setMessage("Your charity preferences have been saved.");
    setSaving(false);
  };

  const selectedCharityData = charities.find(
    (charity) => charity.id === selectedCharity
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <p className="text-sm text-lime-400 font-medium">
          YOUR IMPACT
        </p>

        <h1 className="text-3xl font-bold mt-1">
          Choose Your Charity
        </h1>

        <p className="text-gray-500 mt-2 max-w-2xl">
          Your subscription can support a charity you care about.
          Choose where your contribution goes and decide how much
          of your subscription you want to dedicate.
        </p>
      </div>

      {/* Current selection */}
      {selectedCharityData && (
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-6">

          <div className="flex items-start justify-between gap-5">

            <div className="flex gap-4">

              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center text-lime-400">
                <Heart size={22} fill="currentColor" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Currently supporting
                </p>

                <h2 className="text-xl font-semibold mt-1">
                  {selectedCharityData.name}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  {percentage}% contribution
                </p>
              </div>

            </div>

            <div className="hidden sm:flex items-center gap-2 text-lime-400 text-sm">
              <Check size={17} />
              Selected
            </div>

          </div>

        </div>
      )}

      {/* Search / Filter */}
      <div className="flex flex-col md:flex-row gap-4">

        <div className="relative flex-1">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0d0e0e] border border-white/10 outline-none focus:border-lime-400"
          />

        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 rounded-xl bg-[#0d0e0e] border border-white/10 outline-none focus:border-lime-400 text-gray-300"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

      </div>

      {/* Charity cards */}
      {filteredCharities.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <Heart
            size={32}
            className="mx-auto text-gray-600"
          />

          <p className="text-gray-400 mt-4">
            No charities found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filteredCharities.map((charity) => {
            const isSelected =
              selectedCharity === charity.id;

            return (
              <button
                key={charity.id}
                type="button"
                onClick={() =>
                  setSelectedCharity(charity.id)
                }
                className={`text-left rounded-2xl overflow-hidden border transition ${
                  isSelected
                    ? "border-lime-400 ring-1 ring-lime-400"
                    : "border-white/10 hover:border-white/20"
                }`}
              >

                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-lime-400/10 to-white/5 flex items-center justify-center">

                  {charity.image_url ? (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Heart
                      size={42}
                      className="text-lime-400/40"
                    />
                  )}

                </div>

                {/* Content */}
                <div className="p-5 bg-[#0d0e0e]">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <h3 className="font-semibold text-lg">
                        {charity.name}
                      </h3>

                      {charity.category && (
                        <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-white/5 text-xs text-gray-400">
                          {charity.category}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-lime-400 text-black flex items-center justify-center">
                        <Check size={16} />
                      </div>
                    )}

                  </div>

                  <p className="text-sm text-gray-500 mt-4 line-clamp-3">
                    {charity.description ||
                      "Supporting meaningful change through charitable impact."}
                  </p>

                </div>

              </button>
            );
          })}

        </div>
      )}

      {/* Contribution */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0e0e] p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="p-3 rounded-xl bg-lime-400/10 text-lime-400">
            <Heart size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Your Contribution
            </h2>

            <p className="text-sm text-gray-500">
              Choose the percentage of your subscription you want
              to contribute.
            </p>
          </div>

        </div>

        <div className="max-w-xl">

          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">
              Contribution{" "}
            </span>

            <span className="text-2xl font-bold text-lime-400">
              {percentage}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={percentage}
            onChange={(e) =>
              setPercentage(Number(e.target.value))
            }
            className="w-full accent-lime-400"
          />

          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>10% minimum</span>
            <span>100%</span>
          </div>

        </div>

        {error && (
          <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 p-4 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 text-sm">
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 px-6 py-3 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save Charity Preferences"}
        </button>

      </div>

    </div>
  );
}