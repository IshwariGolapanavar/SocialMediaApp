const express = require("express");

console.log("AUTH ROUTES LOADED");

const {
    signup,
    login
} = require("../controller/authController");

const router = express.Router();

router.post("/signup", (req, res) => {
    console.log("SIGNUP ROUTE REACHED");
    signup(req, res);
});

router.post("/login", login);

module.exports = router;