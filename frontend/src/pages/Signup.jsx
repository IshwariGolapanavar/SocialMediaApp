import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
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
                "http://localhost:5000/api/auth/signup",
                formData
            );

            setMessage(response.data.message);

            setFormData({
                username: "",
                email: "",
                password: ""
            });

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-left signup-side">

                <div className="brand-section">

                    <div className="brand-icon">
                        ✦
                    </div>

                    <h1>Join Connectly</h1>

                    <p>
                        Your world. Your people. Your stories.
                    </p>

                    <div className="feature-list">

                        <div>✨ Share your moments</div>

                        <div>❤️ Connect with people</div>

                        <div>💬 Start conversations</div>

                        <div>📸 Share beautiful memories</div>

                    </div>

                </div>

            </div>

            <div className="auth-right">

                <div className="auth-card">

                    <div className="mobile-brand">
                        <span>✦</span>
                        Connectly
                    </div>

                    <h2>Create Account 🚀</h2>

                    <p className="auth-subtitle">
                        Join our community today
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>Username</label>

                            <input
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />

                        </div>

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
                                placeholder="Create a password"
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
                                ? "Creating account..."
                                : "Create Account"
                            }

                        </button>

                    </form>

                    {message && (
                        <div className="auth-message">
                            {message}
                        </div>
                    )}

                    <p className="switch-auth">

                        Already have an account?

                        <Link to="/login">
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Signup;