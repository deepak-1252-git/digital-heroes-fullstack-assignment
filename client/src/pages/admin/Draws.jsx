import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

const Draws = () => {
  const [drawType, setDrawType] = useState("random");
  const [drawMonth, setDrawMonth] = useState("2026-09-01");

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Please login again");
    }

    return session.access_token;
  };

  const simulateDraw = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/draws/simulate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            drawType,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Simulation failed"
        );
      }

      setSimulation(result.draw);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const publishDraw = async () => {
    if (!simulation) {
      alert("Please simulate the draw first");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to publish this draw?"
    );

    if (!confirmed) return;

    try {
      setPublishing(true);

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/draws/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            drawMonth,
            drawType,
            drawNumbers: simulation.drawNumbers,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Publish failed"
        );
      }

      alert("Draw published successfully!");

      setSimulation(null);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 md:p-10">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-lime-400 text-sm font-medium mb-2">
            ADMIN
          </p>

          <h1 className="text-3xl md:text-4xl font-bold">
            Draw Management
          </h1>

          <p className="text-gray-400 mt-2">
            Simulate, review and publish monthly draws.
          </p>
        </div>


        {/* Controls */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 mb-6">

          <h2 className="text-xl font-semibold mb-6">
            Create Monthly Draw
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {/* Month */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Draw Month
              </label>

              <input
                type="date"
                value={drawMonth}
                onChange={(e) =>
                  setDrawMonth(e.target.value)
                }
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-lime-400"
              />
            </div>


            {/* Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Draw Type
              </label>

              <select
                value={drawType}
                onChange={(e) =>
                  setDrawType(e.target.value)
                }
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-lime-400"
              >
                <option value="random">
                  Random Lottery
                </option>

                <option value="algorithmic">
                  Algorithmic
                </option>
              </select>
            </div>

          </div>


          <button
            onClick={simulateDraw}
            disabled={loading}
            className="mt-6 bg-lime-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-lime-300 transition disabled:opacity-50"
          >
            {loading
              ? "Simulating..."
              : "Simulate Draw"}
          </button>

        </div>


        {/* Simulation */}
        {simulation && (
          <div className="space-y-6">

            {/* Numbers */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Simulation Result
                </h2>

                <span className="text-xs bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full">
                  SIMULATED
                </span>
              </div>


              <p className="text-gray-400 text-sm mb-4">
                Draw Numbers
              </p>

              <div className="flex gap-3 flex-wrap">
                {simulation.drawNumbers.map(
                  (number) => (
                    <div
                      key={number}
                      className="w-14 h-14 rounded-full bg-lime-400 text-black flex items-center justify-center text-xl font-bold"
                    >
                      {number}
                    </div>
                  )
                )}
              </div>

            </div>


            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <Stat
                title="Participants"
                value={
                  simulation.totalParticipants
                }
              />

              <Stat
                title="5 Match"
                value={
                  simulation.winners.fiveMatch.length
                }
              />

              <Stat
                title="4 Match"
                value={
                  simulation.winners.fourMatch.length
                }
              />

              <Stat
                title="3 Match"
                value={
                  simulation.winners.threeMatch.length
                }
              />

            </div>


            {/* Winners */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">

              <h2 className="text-xl font-semibold mb-5">
                Match Breakdown
              </h2>

              <div className="space-y-3">

                <MatchRow
                  label="5 Match Jackpot"
                  count={
                    simulation.winners.fiveMatch.length
                  }
                  percentage="40%"
                />

                <MatchRow
                  label="4 Match"
                  count={
                    simulation.winners.fourMatch.length
                  }
                  percentage="35%"
                />

                <MatchRow
                  label="3 Match"
                  count={
                    simulation.winners.threeMatch.length
                  }
                  percentage="25%"
                />

              </div>

            </div>


            {/* Publish */}
            <div className="bg-lime-400/10 border border-lime-400/20 rounded-2xl p-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>
                  <h3 className="font-semibold text-lg">
                    Ready to publish?
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    Publishing will permanently create the
                    draw, entries, prize pools and winners.
                  </p>
                </div>

                <button
                  onClick={publishDraw}
                  disabled={publishing}
                  className="bg-lime-400 text-black font-bold px-7 py-3 rounded-xl hover:bg-lime-300 transition disabled:opacity-50"
                >
                  {publishing
                    ? "Publishing..."
                    : "Publish Draw"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};


const Stat = ({ title, value }) => (
  <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
    <p className="text-gray-400 text-sm">
      {title}
    </p>

    <p className="text-2xl font-bold mt-2">
      {value}
    </p>
  </div>
);


const MatchRow = ({
  label,
  count,
  percentage,
}) => (
  <div className="flex items-center justify-between bg-[#080808] rounded-xl px-4 py-4">
    <div>
      <p className="font-medium">
        {label}
      </p>

      <p className="text-gray-500 text-sm">
        Prize allocation
      </p>
    </div>

    <div className="flex items-center gap-5">
      <span className="text-gray-400">
        {percentage}
      </span>

      <span className="font-bold">
        {count}
      </span>
    </div>
  </div>
);


export default Draws;