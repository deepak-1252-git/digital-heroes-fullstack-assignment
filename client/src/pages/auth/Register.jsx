import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Register() {
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    full_name: form.fullName
                }
            }
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage(
            "Account created successfully. Please check your email."
        );
    };

    return (
        <div>
            <h1>Create Account</h1>

            <form onSubmit={handleRegister}>
                <input
                    name="fullName"
                    placeholder="Full name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}