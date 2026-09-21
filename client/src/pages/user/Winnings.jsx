import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const Winnings = () => {
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);

    const loadWinnings = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from("winners")
                .select(`
          id,
          match_count,
          prize_amount,
          verification_status,
          payout_status,
          created_at,
          draws (
            draw_month,
            numbers
          ),
          winner_proofs (
            id,
            file_url,
            status,
            admin_note,
            created_at
          )
        `)
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false,
                });

            if (error) throw error;

            setWinners(data || []);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWinnings();
    }, []);

    const uploadProof = async (winnerId, file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image.");
            return;
        }

        if (file.size > 6 * 1024 * 1024) {
            alert("Image must be smaller than 6MB.");
            return;
        }

        try {
            setUploading(winnerId);

            const fileExt = file.name.split(".").pop();

            const filePath =
                `${winnerId}/${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("winner-proofs")
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage
                .from("winner-proofs")
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from("winner_proofs")
                .insert({
                    winner_id: winnerId,
                    file_url: publicUrl,
                    status: "pending",
                });

            if (dbError) throw dbError;

            alert("Proof uploaded successfully.");

            await loadWinnings();

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setUploading(null);
        }
    };

    if (loading) {
        return <div style={styles.center}>Loading winnings...</div>;
    }

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <p style={styles.eyebrow}>YOUR RESULTS</p>

                <h1 style={styles.headerTitle}>Winnings</h1>

                <p style={styles.headerText}>
                    View your prizes and submit verification proof.
                </p>
            </div>

            {winners.length === 0 ? (
                <div style={styles.empty}>
                    No winnings yet.
                </div>
            ) : (
                <div style={styles.list}>

                    {winners.map((winner) => {
                        const proof = winner.winner_proofs?.[0];

                        return (
                            <div
                                key={winner.id}
                                style={styles.card}
                            >

                                <div style={styles.top}>

                                    <div>
                                        <span style={styles.match}>
                                            {winner.match_count}-MATCH
                                        </span>

                                        <h2>
                                            ₹{Number(
                                                winner.prize_amount || 0
                                            ).toLocaleString("en-IN")}
                                        </h2>

                                        <p>
                                            Draw:{" "}
                                            {winner.draws?.draw_month}
                                        </p>
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                ...styles.badge,
                                                ...(winner.verification_status ===
                                                    "approved"
                                                    ? styles.approved
                                                    : winner.verification_status ===
                                                        "rejected"
                                                        ? styles.rejected
                                                        : {}),
                                            }}
                                        >
                                            {winner.verification_status}
                                        </span>
                                    </div>

                                </div>


                                <div style={styles.numbers}>
                                    {(winner.draws?.numbers || []).map(
                                        (number) => (
                                            <span key={number}>
                                                {number}
                                            </span>
                                        )
                                    )}
                                </div>


                                <div style={styles.divider} />


                                {proof ? (
                                    <div style={styles.proof}>

                                        <p>
                                            Proof status:{" "}
                                            <strong>
                                                {proof.status}
                                            </strong>
                                        </p>

                                        <a
                                            href={proof.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View submitted proof
                                        </a>

                                        {proof.admin_note && (
                                            <p style={styles.note}>
                                                Admin: {proof.admin_note}
                                            </p>
                                        )}

                                    </div>
                                ) : (
                                    <label style={styles.upload}>

                                        {uploading === winner.id
                                            ? "Uploading..."
                                            : "Upload Winner Proof"}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            disabled={uploading === winner.id}
                                            onChange={(e) =>
                                                uploadProof(
                                                    winner.id,
                                                    e.target.files[0]
                                                )
                                            }
                                        />

                                    </label>
                                )}


                                <div style={styles.payout}>
                                    <span>Payout</span>

                                    <strong>
                                        {winner.payout_status}
                                    </strong>
                                </div>

                            </div>
                        );
                    })}

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

    center: {
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        color: "#aaa",
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
        fontSize: "38px",
        margin: "8px 0",
    },

    headerText: {
        color: "#888",
    },

    list: {
        display: "grid",
        gap: "20px",
        maxWidth: "850px",
    },

    card: {
        background: "#111313",
        border: "1px solid #272929",
        borderRadius: "18px",
        padding: "25px",
    },

    top: {
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
    },

    match: {
        color: "#a3e635",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "1px",
    },

    h2: {
        fontSize: "30px",
        margin: "8px 0",
    },

    p: {
        color: "#888",
    },

    badge: {
        background: "#292929",
        color: "#aaa",
        padding: "7px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        textTransform: "capitalize",
    },

    approved: {
        background: "#243514",
        color: "#a3e635",
    },

    rejected: {
        background: "#3b2020",
        color: "#ff7777",
    },

    numbers: {
        display: "flex",
        gap: "8px",
        marginTop: "20px",
    },

    divider: {
        height: "1px",
        background: "#272929",
        margin: "22px 0",
    },

    upload: {
        display: "inline-block",
        background: "#a3e635",
        color: "#111",
        padding: "11px 16px",
        borderRadius: "9px",
        fontWeight: 700,
        cursor: "pointer",
    },

    proof: {
        color: "#aaa",
    },

    note: {
        color: "#e7a66a",
    },

    payout: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "22px",
        color: "#999",
    },

    empty: {
        padding: "50px",
        textAlign: "center",
        color: "#777",
    },
};

export default Winnings;