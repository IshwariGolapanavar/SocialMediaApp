import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Home() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState("");
    const [commentText, setCommentText] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    const fetchPosts = async (pageNumber = 1, append = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            const response = await axios.get(
                `${API_BASE_URL}/api/posts?page=${pageNumber}&limit=10`
            );

            const fetchedPosts = response.data.posts || [];
            if (append) {
                setPosts((prev) => [...prev, ...fetchedPosts]);
            } else {
                setPosts(fetchedPosts);
            }

            setHasMore(pageNumber < (response.data.totalPages || 1));
            setPage(pageNumber);
        } catch (error) {
            console.error(error);
            setMessage("Unable to load posts.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPosts(1, false);
    }, []);

    // Check if the current user has already liked a post
    const isPostLiked = (post) => {
        if (!currentUser) return false;
        const currentUserId = currentUser.id || currentUser._id;
        return post.likes?.some((like) => {
            const likeId = typeof like === "object" ? like._id : like;
            return likeId === currentUserId;
        });
    };

    // Instant optimistic like/unlike toggle
    const handleToggleLike = async (postId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const targetPost = posts.find((p) => p._id === postId);
        if (!targetPost) return;

        const currentUserId = currentUser?.id || currentUser?._id;
        const currentUsername = currentUser?.username || "You";
        const alreadyLiked = isPostLiked(targetPost);
        const endpoint = alreadyLiked ? "unlike" : "like";

        // 1. INSTANT OPTIMISTIC UI UPDATE
        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post._id !== postId) return post;

                let updatedLikes;
                if (alreadyLiked) {
                    updatedLikes = (post.likes || []).filter((like) => {
                        const id = typeof like === "object" ? like._id : like;
                        return id !== currentUserId;
                    });
                } else {
                    updatedLikes = [
                        ...(post.likes || []),
                        { _id: currentUserId, username: currentUsername }
                    ];
                }

                return {
                    ...post,
                    likes: updatedLikes,
                    likesCount: alreadyLiked
                        ? Math.max(0, (post.likesCount || 1) - 1)
                        : (post.likesCount || 0) + 1
                };
            })
        );

        // 2. NETWORK CALL IN BACKGROUND
        try {
            await axios.post(
                `${API_BASE_URL}/api/posts/${postId}/${endpoint}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            // Revert optimistic update on failure
            setPosts((prevPosts) =>
                prevPosts.map((p) => (p._id === postId ? targetPost : p))
            );
            setMessage(
                error.response?.data?.message || `Unable to ${endpoint} post`
            );
        }
    };

    const handleCommentChange = (postId, value) => {
        setCommentText({
            ...commentText,
            [postId]: value
        });
    };

    // Instant optimistic comment submission
    const handleComment = async (postId) => {
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

        const trimmedText = text.trim();
        const currentUserId = currentUser?.id || currentUser?._id;
        const currentUsername = currentUser?.username || "You";

        // Clear input immediately for snappy UX
        setCommentText((prev) => ({
            ...prev,
            [postId]: ""
        }));
        setMessage("");

        // 1. INSTANT OPTIMISTIC UI UPDATE
        const tempCommentId = `temp-${Date.now()}`;
        const optimisticComment = {
            _id: tempCommentId,
            user: {
                _id: currentUserId,
                username: currentUsername
            },
            text: trimmedText,
            createdAt: new Date().toISOString()
        };

        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post._id !== postId) return post;
                return {
                    ...post,
                    commentsCount: (post.commentsCount || 0) + 1,
                    comments: [...(post.comments || []), optimisticComment]
                };
            })
        );

        // 2. NETWORK CALL IN BACKGROUND
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/posts/${postId}/comment`,
                { text: trimmedText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Replace temporary comment list with server-validated populated comments
            if (response.data.comments) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) => {
                        if (post._id !== postId) return post;
                        return {
                            ...post,
                            commentsCount: response.data.commentCount,
                            comments: response.data.comments
                        };
                    })
                );
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to add comment"
            );
            // Re-sync posts if error occurs
            fetchPosts(page, false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="app-page">
            {/* NAVBAR */}
            <nav className="navbar">
                <Link to="/home" className="navbar-brand">
                    <span className="brand-small-icon">✦</span>
                    Connectly
                </Link>

                <div className="nav-actions">
                    {currentUser?.username && (
                        <span className="nav-username">
                            @{currentUser.username}
                        </span>
                    )}

                    <Link to="/home" className="nav-link active">
                        Home
                    </Link>

                    <Link to="/create-post" className="create-nav-button">
                        ＋ Create Post
                    </Link>

                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="feed-container">
                <div className="feed-header">
                    <div>
                        <h1>Discover & Share ✨</h1>
                        <p>
                            {currentUser?.username
                                ? `Welcome back, @${currentUser.username}! See what people are sharing.`
                                : "See what people are sharing today."}
                        </p>
                    </div>

                    <Link to="/create-post" className="main-create-button">
                        ＋ New Post
                    </Link>
                </div>

                {message && <div className="notification">{message}</div>}

                {loading ? (
                    <div className="loading-feed">
                        <p>Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-feed">
                        <div className="empty-icon">📭</div>
                        <h2>No posts yet</h2>
                        <p>Be the first person to share something!</p>
                        <Link to="/create-post" className="main-create-button">
                            Create First Post
                        </Link>
                    </div>
                ) : (
                    <div className="posts-list">
                        {posts.map((post) => {
                            const liked = isPostLiked(post);

                            return (
                                <article
                                    className="post-card-modern"
                                    key={post._id}
                                >
                                    {/* POST HEADER */}
                                    <div className="post-header">
                                        <div className="user-avatar">
                                            {post.user?.username
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                        </div>

                                        <div className="user-details">
                                            <h3>@{post.user?.username || "anonymous"}</h3>
                                            <span>Community member</span>
                                        </div>

                                        <div className="post-menu">•••</div>
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
                                                src={`${API_BASE_URL}/uploads/${post.image}`}
                                                alt="Post"
                                                className="post-image-modern"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const wrapper = e.target.closest(".post-image-wrapper");
                                                    if (wrapper) wrapper.style.display = "none";
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* STATS */}
                                    <div className="post-stat-row">
                                        <span>
                                            ❤️ {post.likesCount || 0} likes
                                        </span>
                                        <span>
                                            💬 {post.commentsCount || 0} comments
                                        </span>
                                    </div>

                                    {/* ACTION BUTTONS (Single Toggle Like Button) */}
                                    <div className="post-actions-modern">
                                        <button
                                            className={`like-toggle-button ${
                                                liked ? "liked" : ""
                                            }`}
                                            onClick={() =>
                                                handleToggleLike(post._id)
                                            }
                                        >
                                            <span>{liked ? "❤️" : "🤍"}</span>
                                            {liked ? "Liked" : "Like"}
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

                                    {/* COMMENTS LIST */}
                                    <div className="comments-modern">
                                        {post.comments &&
                                            post.comments.length > 0 && (
                                                <div>
                                                    <h4>
                                                        Comments (
                                                        {post.comments.length})
                                                    </h4>

                                                    {post.comments.map(
                                                        (comment, index) => (
                                                            <div
                                                                className="comment-modern"
                                                                key={
                                                                    comment._id ||
                                                                    index
                                                                }
                                                            >
                                                                <div className="comment-avatar">
                                                                    {comment.user?.username
                                                                        ?.charAt(0)
                                                                        ?.toUpperCase() ||
                                                                        "U"}
                                                                </div>

                                                                <div className="comment-content">
                                                                    <strong>
                                                                        @
                                                                        {comment
                                                                            .user
                                                                            ?.username ||
                                                                            "user"}
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
                                            {currentUser?.username
                                                ?.charAt(0)
                                                ?.toUpperCase() || "👤"}
                                        </div>

                                        <input
                                            id={`comment-${post._id}`}
                                            type="text"
                                            placeholder="Write a comment..."
                                            value={commentText[post._id] || ""}
                                            onChange={(e) =>
                                                handleCommentChange(
                                                    post._id,
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleComment(post._id);
                                                }
                                            }}
                                        />

                                        <button
                                            className="send-comment-button"
                                            onClick={() =>
                                                handleComment(post._id)
                                            }
                                            title="Post comment"
                                        >
                                            ➤
                                        </button>
                                    </div>
                                </article>
                            );
                        })}

                        {/* PAGINATION: LOAD MORE BUTTON */}
                        {hasMore && (
                            <div className="pagination-container">
                                <button
                                    className="load-more-button"
                                    onClick={() => fetchPosts(page + 1, true)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore
                                        ? "Loading more posts..."
                                        : "Load More Posts ↓"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;