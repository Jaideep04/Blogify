const { Router } = require("express");
const User = require('../models/user');
const router = Router();

// Signup route (GET and POST)
router.get("/signup", (req, res) => {
    return res.render("signup",{ user: req.user || null });
});

router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;
    await User.create({ fullName, email, password });
    return res.redirect("/signin");
});

// Signin route (GET and POST)
router.get("/signin", (req, res) => {
    return res.render("signin",{ user: req.user || null });
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        if (!token) {
            // If no token is generated, send a failure response
            console.log("Invalid credentials, no token generated");
            return res.render("signin", {
                error: "Incorrect Credentials"
            });
        }
        console.log("Token: ", token);
        return res.cookie('token', token).redirect("/");
    } catch (error) {
        console.error(error);
        return res.render("signin", { error: "Incorrect Credentials" });
    }
});

router.get("/logout" , (req,res)=>{
    res.clearCookie("token").redirect('/');
})

module.exports = router;
