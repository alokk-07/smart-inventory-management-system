
import { useState } from "react";
import { Package, Lock, Mail } from "lucide-react";
import { loginAdmin } from "../services/authService";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginAdmin(email, password);

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));

            onLogin(data.user);
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-logo">
                    <Package size={30} />
                </div>

                <h1>SmartStock</h1>
                <p className="login-subtitle">
                    Inventory Management System
                </p>

                <h2>Welcome back!</h2>
                <p className="login-description">
                    Sign in to access your inventory dashboard.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Email Address</label>
                    <div className="login-input">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <label>Password</label>
                    <div className="login-input">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="login-error">{error}</p>
                    )}

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

                <p className="login-footer">
                    Secure Administrator Access
                </p>
            </div>
        </div>
    );
}

export default Login;
