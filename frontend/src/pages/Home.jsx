import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Home() {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState("");
    const [commentText, setCommentText] = useState({});

    const fetchPosts = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/posts"
            );

            setPosts(response.data.posts);

        } catch (error) {

            console.error(error);

            setMessage("Unable to load posts.");
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLike = async (postId) => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            await axios.post(
                `http://localhost:5000/api/posts/${postId}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchPosts();

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Unable to like post"
            );
        }
    };

    const handleUnlike = async (postId) => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            await axios.post(
                `http://localhost:5000/api/posts/${postId}/unlike`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchPosts();

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Unable to unlike post"
            );
        }
    };

    const handleCommentChange = (postId, value) => {

        setCommentText({
            ...commentText,
            [postId]: value
        });
    };

    const handleComment = async (postId) => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const text = commentText[postId];

            if (!text || text.trim() === "") {

                setMessage("Comment cannot be empty");

                return;
            }

            await axios.post(
                `http://localhost:5000/api/posts/${postId}/comment`,
                {
                    text: text.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCommentText({
                ...commentText,
                [postId]: ""
            });

            fetchPosts();

            setMessage("");

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Unable to add comment"
            );
        }
    };

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");
    };

    return (
        <div className="app-page">

            {/* NAVBAR */}

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
                        className="nav-link active"
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
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* MAIN CONTENT */}

            <main className="feed-container">

                <div className="feed-header">

                    <div>

                        <h1>
                            Discover & Share ✨
                        </h1>

                        <p>
                            See what people are sharing today.
                        </p>

                    </div>

                    <Link
                        to="/create-post"
                        className="main-create-button"
                    >
                        ＋ New Post
                    </Link>

                </div>

                {message && (
                    <div className="notification">
                        {message}
                    </div>
                )}

                {posts.length === 0 ? (

                    <div className="empty-feed">

                        <div className="empty-icon">
                            📭
                        </div>

                        <h2>No posts yet</h2>

                        <p>
                            Be the first person to share something!
                        </p>

                        <Link
                            to="/create-post"
                            className="main-create-button"
                        >
                            Create First Post
                        </Link>

                    </div>

                ) : (

                    <div className="posts-list">

                        {posts.map((post) => (

                            <article
                                className="post-card-modern"
                                key={post._id}
                            >

                                {/* POST HEADER */}

                                <div className="post-header">

                                    <div className="user-avatar">

                                        {post.user?.username
                                            ?.charAt(0)
                                            ?.toUpperCase()
                                        }

                                    </div>

                                    <div className="user-details">

                                        <h3>
                                            @{post.user?.username}
                                        </h3>

                                        <span>
                                            Community member
                                        </span>

                                    </div>

                                    <div className="post-menu">
                                        •••
                                    </div>

                                </div>

                                {/* POST TEXT */}

                                {post.text && (
                                    <p className="post-text-modern">
                                        {post.text}
                                    </p>
                                )}

                                {/* POST IMAGE */}

                                {post.image && (
                                    <div className="post-image-wrapper">

                                        <img
                                            src={`http://localhost:5000/uploads/${post.image}`}
                                            alt="Post"
                                            className="post-image-modern"
                                        />

                                    </div>
                                )}

                                {/* STATS */}

                                <div className="post-stat-row">

                                    <span>
                                        ❤️ {post.likesCount} likes
                                    </span>

                                    <span>
                                        {post.commentsCount} comments
                                    </span>

                                </div>

                                {/* ACTION BUTTONS */}

                                <div className="post-actions-modern">

                                    <button
                                        className="like-button"
                                        onClick={() =>
                                            handleLike(post._id)
                                        }
                                    >
                                        <span>❤️</span>
                                        Like
                                    </button>

                                    <button
                                        className="unlike-button"
                                        onClick={() =>
                                            handleUnlike(post._id)
                                        }
                                    >
                                        <span>💔</span>
                                        Unlike
                                    </button>

                                    <button
                                        className="comment-action-button"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    `comment-${post._id}`
                                                )
                                                ?.focus()
                                        }
                                    >
                                        <span>💬</span>
                                        Comment
                                    </button>

                                </div>

                                {/* COMMENTS */}

                                <div className="comments-modern">

                                    {post.comments &&
                                        post.comments.length > 0 && (

                                            <div>

                                                <h4>
                                                    Comments
                                                </h4>

                                                {post.comments.map(
                                                    (comment) => (

                                                        <div
                                                            className="comment-modern"
                                                            key={
                                                                comment._id
                                                            }
                                                        >

                                                            <div className="comment-avatar">

                                                                {comment.user
                                                                    ?.username
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()
                                                                }

                                                            </div>

                                                            <div className="comment-content">

                                                                <strong>
                                                                    @{comment.user?.username}
                                                                </strong>

                                                                <p>
                                                                    {comment.text}
                                                                </p>

                                                            </div>

                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        )}

                                </div>

                                {/* COMMENT INPUT */}

                                <div className="comment-input-wrapper">

                                    <div className="comment-user-avatar">
                                        👤
                                    </div>

                                    <input
                                        id={`comment-${post._id}`}
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={
                                            commentText[post._id] || ""
                                        }
                                        onChange={(e) =>
                                            handleCommentChange(
                                                post._id,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {

                                            if (
                                                e.key === "Enter"
                                            ) {

                                                handleComment(
                                                    post._id
                                                );
                                            }
                                        }}
                                    />

                                    <button
                                        className="send-comment-button"
                                        onClick={() =>
                                            handleComment(
                                                post._id
                                            )
                                        }
                                    >
                                        ➤
                                    </button>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </main>

        </div>
    );
}

export default Home;