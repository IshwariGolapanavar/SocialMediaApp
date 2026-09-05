const Post = require("../models/Post");

// CREATE POST
const createPost = async (req, res) => {
    try {
        const { text } = req.body;

        // User must provide text or image
        if (!text && !req.file) {
            return res.status(400).json({
                message: "Post must contain text or image"
            });
        }

        const post = await Post.create({
            user: req.user.userId,
            text: text || "",
            image: req.file ? req.file.filename : null
        });

        res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        console.error("Create post error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET ALL POSTS (Supports optional pagination)
const getAllPosts = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        let query = Post.find()
            .populate("user", "username email")
            .populate("likes", "username")
            .populate("comments.user", "username")
            .sort({ createdAt: -1 });

        const totalPosts = await Post.countDocuments();

        if (page && limit) {
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
        }

        const posts = await query;

        res.status(200).json({
            message: "Posts fetched successfully",
            totalPosts,
            totalPages: (page && limit) ? Math.ceil(totalPosts / limit) : 1,
            currentPage: page || 1,
            posts: posts.map(post => ({
                _id: post._id,

                // Post owner
                user: post.user,

                // Post content
                text: post.text,
                image: post.image,

                // Likes
                likesCount: post.likes.length,
                likes: post.likes,

                // Comments
                commentsCount: post.comments.length,
                comments: post.comments,

                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            }))
        });

    } catch (error) {
        console.error("Get posts error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// LIKE POST
const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Check if user already liked the post
        if (post.likes.includes(userId)) {
            return res.status(400).json({
                message: "You already liked this post"
            });
        }

        // Add user to likes
        post.likes.push(userId);

        await post.save();

        res.status(200).json({
            message: "Post liked successfully",
            likesCount: post.likes.length,
            likes: post.likes
        });

    } catch (error) {
        console.error("Like post error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// UNLIKE POST
const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Check if user has liked the post
        if (!post.likes.includes(userId)) {
            return res.status(400).json({
                message: "You have not liked this post"
            });
        }

        // Remove user from likes
        post.likes = post.likes.filter(
            (id) => id.toString() !== userId.toString()
        );

        await post.save();

        res.status(200).json({
            message: "Post unliked successfully",
            likesCount: post.likes.length,
            likes: post.likes
        });

    } catch (error) {
        console.error("Unlike post error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// ADD COMMENT
const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const { text } = req.body;

        // Check comment text
        if (!text || text.trim() === "") {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        // Find post
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Add comment
        post.comments.push({
            user: userId,
            text: text.trim()
        });

        await post.save();

        // Get updated post with username
        const updatedPost = await Post.findById(postId)
            .populate("comments.user", "username");

        res.status(201).json({
            message: "Comment added successfully",
            commentCount: updatedPost.comments.length,
            comments: updatedPost.comments
        });

    } catch (error) {
        console.error("Add comment error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    likePost,
    unlikePost,
    addComment
};