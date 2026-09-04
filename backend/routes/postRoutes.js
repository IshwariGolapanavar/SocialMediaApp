const express = require("express");

const {
    createPost,
    getAllPosts,
    likePost,
    unlikePost,
    addComment
} = require("../controller/postController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// CREATE POST
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createPost
);


// GET ALL POSTS
router.get(
    "/",
    getAllPosts
);


// LIKE POST
router.post(
    "/:id/like",
    authMiddleware,
    likePost
);


// UNLIKE POST
router.post(
    "/:id/unlike",
    authMiddleware,
    unlikePost
);


// ADD COMMENT
router.post(
    "/:id/comment",
    authMiddleware,
    addComment
);


module.exports = router;