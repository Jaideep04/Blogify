require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const UserRoute = require("./routes/user");
const BlogRoute = require("./routes/blog");
const Blog = require('./models/blog');


const { checkAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT;

mongoose
    .connect(process.env.MONGODB_URL)
    .then((e)=>console.log("DataBaseConnected"));

app.set("view engine" , "ejs");
app.set("views",path.resolve("./views"));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkAuthenticationCookie('token'));
app.use(express.static(path.resolve("./public/uploads")));

app.get('/', async(req,res) => {
    const allBlogs = await Blog.find({});
    res.render('home',{user:req.user, blogs:allBlogs});
});

app.use('/user',UserRoute);
app.use('/blog',BlogRoute);

app.listen(PORT,()=>console.log(`Server Started at PORT:${PORT}`));