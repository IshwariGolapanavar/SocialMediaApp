import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {

            const response = await axios.post(
                `${API_BASE_URL}/api/auth/login`,
                formData
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setMessage("Login successful!");

            setTimeout(() => {
                navigate("/home");
            }, 500);

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Login failed. Please check your details."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-left">

                <div className="brand-section">

                    <div className="brand-icon">
                        ✦
                    </div>

                    <h1>Connectly</h1>

                    <p>
                        Connect. Share. Inspire.
                    </p>

                </div>

            </div>

            <div className="auth-right">

                <div className="auth-card">

                    <div className="mobile-brand">
                        <span>✦</span>
                        Connectly
                    </div>

                    <h2>Welcome Back 👋</h2>

                    <p className="auth-subtitle">
                        Login to continue to your account
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Logging in..."
                                : "Login"
                            }

                        </button>

                    </form>

                    {message && (
                        <div className="auth-message">
                            {message}
                        </div>
                    )}

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <p className="switch-auth">

                        Don't have an account?

                        <Link to="/signup">
                            Create Account
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;