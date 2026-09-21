import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                throw new Error("Please login");
            }

            const response = await fetch(
                `${API_URL}/api/admin/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to load dashboard");
            }

            setData(result);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div style={styles.loading}>
                Loading admin dashboard...
            </div>
        );
    }

    if (!data) {
        return (
            <div style={styles.loading}>
                Unable to load dashboard.
            </div>
        );
    }

    const stats = [
        {
            title: "Total Users",
            value: data.stats.users,
            icon: "👥",
        },
        {
            title: "Active Subscriptions",
            value: data.stats.activeSubscriptions,
            icon: "💳",
        },
        {
            title: "Total Subscriptions",
            value: data.stats.subscriptions,
            icon: "📊",
        },
        {
            title: "Golf Scores",
            value: data.stats.scores,
            icon: "⛳",
        },
        {
            title: "Active Charities",
            value: data.stats.charities,
            icon: "❤️",
        },
        {
            title: "Winners",
            value: data.stats.winners,
            icon: "🏆",
        },
    ];

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <div>
                    <p style={styles.eyebrow}>ADMIN PANEL</p>

                    <h1 style={styles.title}>
                        Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Overview of your platform activity
                    </p>
                </div>

                <button
                    style={styles.refresh}
                    onClick={loadDashboard}
                >
                    ↻ Refresh
                </button>
            </div>


            {/* STATS */}

            <div style={styles.statsGrid}>
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        style={styles.card}
                    >
                        <div style={styles.cardTop}>
                            <span style={styles.icon}>
                                {stat.icon}
                            </span>

                            <span style={styles.dot} />
                        </div>

                        <p style={styles.cardTitle}>
                            {stat.title}
                        </p>

                        <h2 style={styles.number}>
                            {stat.value}
                        </h2>
                    </div>
                ))}
            </div>


            {/* RECENT DRAWS */}

            <div style={styles.section}>

                <div style={styles.sectionHeader}>
                    <div>
                        <p style={styles.eyebrow}>
                            DRAW ACTIVITY
                        </p>

                        <h2 style={styles.sectionTitle}>
                            Recent Draws
                        </h2>
                    </div>
                </div>


                {data.recentDraws.length === 0 ? (
                    <div style={styles.empty}>
                        No draws created yet.
                    </div>
                ) : (
                    <div style={styles.drawList}>

                        {data.recentDraws.map((draw) => (
                            <div
                                key={draw.id}
                                style={styles.drawRow}
                            >

                                <div>
                                    <strong>
                                        {draw.draw_month}
                                    </strong>

                                    <p style={styles.small}>
                                        {draw.draw_type} lottery
                                    </p>
                                </div>


                                <div style={styles.numbers}>
                                    {(draw.numbers || []).map(
                                        (number) => (
                                            <span
                                                key={number}
                                                style={styles.numberBall}
                                            >
                                                {number}
                                            </span>
                                        )
                                    )}
                                </div>


                                <span
                                    style={{
                                        ...styles.status,
                                        ...(draw.status === "published"
                                            ? styles.published
                                            : {}),
                                    }}
                                >
                                    {draw.status}
                                </span>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};


const styles = {
    page: {
        minHeight: "100vh",
        padding: "40px",
        background: "#080909",
        color: "#fff",
    },

    loading: {
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#080909",
        color: "#fff",
        fontSize: "18px",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "35px",
    },

    eyebrow: {
        margin: 0,
        color: "#a3e635",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "2px",
    },

    title: {
        fontSize: "42px",
        margin: "7px 0",
    },

    subtitle: {
        margin: 0,
        color: "#8c8c8c",
    },

    refresh: {
        background: "#a3e635",
        color: "#101010",
        border: "none",
        padding: "11px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 700,
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "18px",
    },

    card: {
        background: "#111313",
        border: "1px solid #242626",
        borderRadius: "18px",
        padding: "22px",
    },

    cardTop: {
        display: "flex",
        justifyContent: "space-between",
    },

    icon: {
        fontSize: "24px",
    },

    dot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#a3e635",
    },

    cardTitle: {
        color: "#8c8c8c",
        marginBottom: "5px",
    },

    number: {
        fontSize: "34px",
        margin: 0,
    },

    section: {
        marginTop: "35px",
        background: "#111313",
        border: "1px solid #242626",
        borderRadius: "18px",
        padding: "25px",
    },

    sectionHeader: {
        marginBottom: "20px",
    },

    sectionTitle: {
        margin: "6px 0 0",
        fontSize: "24px",
    },

    drawList: {
        display: "flex",
        flexDirection: "column",
    },

    drawRow: {
        display: "grid",
        gridTemplateColumns: "1fr 2fr auto",
        alignItems: "center",
        gap: "20px",
        padding: "18px 0",
        borderBottom: "1px solid #242626",
    },

    small: {
        margin: "5px 0 0",
        color: "#777",
        fontSize: "13px",
    },

    numbers: {
        display: "flex",
        gap: "8px",
    },

    numberBall: {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        background: "#202323",
        display: "grid",
        placeItems: "center",
        fontSize: "13px",
        fontWeight: 700,
    },

    status: {
        padding: "6px 10px",
        borderRadius: "20px",
        background: "#242424",
        color: "#aaa",
        fontSize: "12px",
        textTransform: "capitalize",
    },

    published: {
        background: "#243514",
        color: "#a3e635",
    },

    empty: {
        padding: "30px",
        textAlign: "center",
        color: "#777",
    },
};

export default AdminDashboard;