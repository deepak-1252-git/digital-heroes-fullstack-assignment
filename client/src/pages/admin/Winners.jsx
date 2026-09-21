import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWinners = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_URL}/api/winners`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load winners"
        );
      }

      setWinners(result.winners || []);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  const updateWinner = async (
    winnerId,
    action
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_URL}/api/winners/${winnerId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Action failed"
        );
      }

      await loadWinners();

    } catch (error) {
      alert(error.message);
    }
  };


  useEffect(() => {
    loadWinners();
  }, []);


  if (loading) {
    return (
      <div style={styles.center}>
        Loading winners...
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

          <h1>Winner Verification</h1>

          <p>
            Review winner proof and process payouts.
          </p>
        </div>
      </div>


      {winners.length === 0 ? (
        <div style={styles.empty}>
          No winners available.
        </div>
      ) : (

        <div style={styles.list}>

          {winners.map((winner) => (

            <div
              key={winner.id}
              style={styles.card}
            >

              <div style={styles.top}>

                <div>
                  <h2>
                    {winner.profiles?.full_name ||
                      "Unknown User"}
                  </h2>

                  <p>
                    {winner.profiles?.email}
                  </p>
                </div>

                <div style={styles.prize}>
                  ₹
                  {Number(
                    winner.prize_amount || 0
                  ).toLocaleString("en-IN")}
                </div>

              </div>


              <div style={styles.info}>

                <span>
                  {winner.match_count}-Match
                </span>

                <span>
                  Draw:{" "}
                  {winner.draws?.draw_month}
                </span>

                <span>
                  Verification:{" "}
                  {winner.verification_status}
                </span>

                <span>
                  Payout:{" "}
                  {winner.payout_status}
                </span>

              </div>


              {winner.winner_proofs?.length > 0 && (
                <div style={styles.proof}>

                  <strong>
                    Proof submitted
                  </strong>

                  <a
                    href={
                      winner.winner_proofs[0]
                        .file_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Screenshot
                  </a>

                </div>
              )}


              <div style={styles.actions}>

                {winner.verification_status ===
                  "pending" && (
                  <>
                    <button
                      style={styles.approve}
                      onClick={() =>
                        updateWinner(
                          winner.id,
                          "approve"
                        )
                      }
                    >
                      ✓ Approve
                    </button>

                    <button
                      style={styles.reject}
                      onClick={() =>
                        updateWinner(
                          winner.id,
                          "reject"
                        )
                      }
                    >
                      Reject
                    </button>
                  </>
                )}


                {winner.verification_status ===
                  "approved" &&
                  winner.payout_status ===
                    "pending" && (

                  <button
                    style={styles.pay}
                    onClick={() =>
                      updateWinner(
                        winner.id,
                        "payout"
                      )
                    }
                  >
                    Mark as Paid
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};


const styles = {
  page: {
    padding: "35px",
    minHeight: "100vh",
    background: "#080909",
    color: "#fff",
  },

  center: {
    minHeight: "80vh",
    display: "grid",
    placeItems: "center",
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

  headerTitle: {
    fontSize: "40px",
    margin: "7px 0",
  },

  headerText: {
    color: "#888",
  },

  list: {
    display: "grid",
    gap: "18px",
  },

  card: {
    background: "#111313",
    border: "1px solid #252727",
    borderRadius: "18px",
    padding: "22px",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  prize: {
    color: "#a3e635",
    fontSize: "25px",
    fontWeight: 800,
  },

  info: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },

  proof: {
    marginTop: "20px",
    padding: "15px",
    background: "#191b1b",
    borderRadius: "10px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  approve: {
    background: "#a3e635",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
  },

  reject: {
    background: "#382020",
    color: "#ff7777",
    border: "1px solid #5c2929",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  pay: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
  },

  empty: {
    padding: "50px",
    textAlign: "center",
    color: "#777",
  },
};

export default Winners;