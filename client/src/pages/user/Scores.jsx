import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [score, setScore] = useState("");
  const [playedAt, setPlayedAt] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
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

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setScores(data || []);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setScore("");
    setPlayedAt("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const numericScore = Number(score);

    // Score validation
    if (!numericScore || numericScore < 1 || numericScore > 45) {
      setError("Stableford score must be between 1 and 45.");
      return;
    }

    if (!playedAt) {
      setError("Please select a score date.");
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

    let result;

    if (editingId) {
      result = await supabase
        .from("scores")
        .update({
          score: numericScore,
          played_at: playedAt,
        })
        .eq("id", editingId)
        .eq("user_id", user.id);
    } else {
      result = await supabase
        .from("scores")
        .insert({
          user_id: user.id,
          score: numericScore,
          played_at: playedAt,
        });
    }

    if (result.error) {
      if (result.error.code === "23505") {
        setError("A score already exists for this date.");
      } else {
        setError(result.error.message);
      }

      setSaving(false);
      return;
    }

    setSuccess(
      editingId
        ? "Score updated successfully."
        : "Score added successfully."
    );

    resetForm();
    await fetchScores();

    setSaving(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setScore(item.score);
    setPlayedAt(item.played_at);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Score deleted successfully.");
    await fetchScores();
  };

  const formatDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <p className="text-sm text-lime-400 font-medium">
          PERFORMANCE
        </p>

        <h1 className="text-3xl font-bold mt-1">
          Golf Scores
        </h1>

        <p className="text-gray-500 mt-2">
          Keep your latest five Stableford scores ready for the monthly draw.
        </p>
      </div>

      {/* Form */}
      <div className="bg-[#0d0e0e] border border-white/10 rounded-2xl p-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-lime-400/10 text-lime-400">
            <Plus size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              {editingId ? "Edit Score" : "Add New Score"}
            </h2>

            <p className="text-sm text-gray-500">
              Stableford score must be between 1 and 45.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >

          {/* Score */}
          <div>
            <label className="text-sm text-gray-400">
              Stableford Score
            </label>

            <input
              type="number"
              min="1"
              max="45"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 32"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-black border border-white/10 outline-none focus:border-lime-400"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-gray-400">
              Score Date
            </label>

            <input
              type="date"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-black border border-white/10 outline-none focus:border-lime-400"
            />
          </div>

          {/* Button */}
          <div className="flex items-end gap-3">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-5 py-3 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 disabled:opacity-50 transition"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Score"
                : "Add Score"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>
            )}

          </div>

        </form>

        {/* Messages */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 text-sm">
            {success}
          </div>
        )}

      </div>

      {/* Scores */}
      <div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Your Latest Scores
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {scores.length} of 5 scores stored
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">
            Loading scores...
          </div>
        ) : scores.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center">
            <CalendarDays
              size={32}
              className="mx-auto text-gray-600"
            />

            <p className="text-gray-400 mt-4">
              No golf scores yet.
            </p>

            <p className="text-gray-600 text-sm mt-1">
              Add your first Stableford score above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {scores.map((item, index) => (
              <div
                key={item.id}
                className="bg-[#0d0e0e] border border-white/10 rounded-2xl p-5 flex items-center justify-between"
              >

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-bold">
                    {item.score}
                  </div>

                  <div>
                    <p className="font-medium">
                      Stableford Score
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatDate(item.played_at)}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                    title="Edit"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/5"
                    title="Delete"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}