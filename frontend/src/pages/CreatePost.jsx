import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function CreatePost() {

    const navigate = useNavigate();

    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Select image
    const handleImageChange = (e) => {

        const selectedImage = e.target.files[0];

        if (selectedImage) {

            setImage(selectedImage);

            setPreview(
                URL.createObjectURL(selectedImage)
            );

            setMessage("");
        }
    };

    // Remove selected image
    const removeImage = () => {

        setImage(null);
        setPreview(null);

        document.getElementById(
            "imageInput"
        ).value = "";
    };

    // Create post
    const handleSubmit = async (e) => {

        e.preventDefault();

        // Text OR image is required
        if (!text.trim() && !image) {

            setMessage(
                "Please write something or select an image."
            );

            return;
        }

        try {

            setLoading(true);
            setMessage("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                navigate("/login");

                return;
            }

            const formData = new FormData();

            if (text.trim()) {

                formData.append(
                    "text",
                    text.trim()
                );
            }

            if (image) {

                formData.append(
                    "image",
                    image
                );
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/posts`,
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMessage(
                response.data.message
            );

            // Clear form
            setText("");
            setImage(null);
            setPreview(null);

            document.getElementById(
                "imageInput"
            ).value = "";

            // Return to feed
            setTimeout(() => {

                navigate("/home");

            }, 1000);

        } catch (error) {

            console.error(
                "Create post error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to create post"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="app-page">

            {/* ================= NAVBAR ================= */}

            <nav className="navbar">

                <Link
                    to="/home"
                    className="navbar-brand"
                >

                    <span className="brand-small-icon">
                        ✦
                    </span>

                    Connectly

                </Link>

                <div className="nav-actions">

                    <Link
                        to="/home"
                        className="nav-link"
                    >
                        Home
                    </Link>

                    <Link
                        to="/create-post"
                        className="create-nav-button"
                    >
                        ＋ Create Post
                    </Link>

                    <button
                        className="logout-button"
                        onClick={() => {

                            localStorage.removeItem(
                                "token"
                            );

                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ================= CREATE PAGE ================= */}

            <main className="create-page">

                <div className="create-card">

                    {/* Header */}

                    <div className="create-header">

                        <div className="create-icon">
                            ✨
                        </div>

                        <div>

                            <h1>
                                Create a Post
                            </h1>

                            <p>
                                Share your thoughts and moments
                                with the community.
                            </p>

                        </div>

                    </div>


                    {/* FORM */}

                    <form
                        onSubmit={handleSubmit}
                        className="create-form"
                    >

                        {/* Text area */}

                        <div className="post-text-area">

                            <textarea
                                placeholder="What's on your mind? 💭"
                                value={text}
                                onChange={(e) =>
                                    setText(
                                        e.target.value
                                    )
                                }
                                rows="6"
                                maxLength="500"
                            />

                            <div className="character-count">
                                {text.length}/500
                            </div>

                        </div>


                        {/* IMAGE PREVIEW */}

                        {preview && (

                            <div className="preview-container">

                                <div className="preview-title">
                                    Image Preview
                                </div>

                                <div className="preview-image-wrapper">

                                    <img
                                        src={preview}
                                        alt="Selected preview"
                                        className="preview-image"
                                    />

                                    <button
                                        type="button"
                                        className="preview-remove"
                                        onClick={
                                            removeImage
                                        }
                                    >
                                        ✕
                                    </button>

                                </div>

                                <button
                                    type="button"
                                    className="remove-image-button"
                                    onClick={
                                        removeImage
                                    }
                                >
                                    🗑 Remove Image
                                </button>

                            </div>

                        )}


                        {/* IMAGE UPLOAD */}

                        {!preview && (

                            <label
                                htmlFor="imageInput"
                                className="image-upload-box"
                            >

                                <span className="upload-icon">
                                    📷
                                </span>

                                <strong>
                                    Add a photo
                                </strong>

                                <small>
                                    Click here to upload an image
                                </small>

                                <small>
                                    JPG, PNG, JPEG supported
                                </small>

                            </label>

                        )}


                        <input
                            id="imageInput"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={
                                handleImageChange
                            }
                            hidden
                        />


                        {/* BUTTONS */}

                        <div className="create-buttons">

                            <Link
                                to="/home"
                                className="cancel-button"
                            >
                                Cancel
                            </Link>

                            <button
                                className="publish-button"
                                type="submit"
                                disabled={loading}
                            >

                                {loading
                                    ? "Publishing..."
                                    : "🚀 Publish Post"
                                }

                            </button>

                        </div>

                    </form>


                    {/* MESSAGE */}

                    {message && (

                        <div className="create-message">

                            {message}

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default CreatePost;
