//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

//1. Connect to our MongoDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true}); //userDB is the name of the database

//2. Set up new user database by creating a Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//6. Define secret - This is now in the .env file


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); //This plugin has to come before the userSchema model beacuase we have to encrypt.

//3. Use schema to set up a new user MODEL
const User = new mongoose.model("User", userSchema); //The "User" string is the name of the collection

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", async function(req, res){
    //4. Creating brand new user
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    try {
        await newUser.save();
        res.render("secrets");
    } catch (err) {
        console.error(err);
    }
});

app.post("/login", async function(req, res) {
    //5. Check if user exists and if the password matches the user
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });

        if (foundUser && foundUser.password === password) {
            res.render("secrets");
        } else {
            // Handle incorrect username or password
            res.send("Invalid username or password.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});



app.listen(3000, function(){
    console.log(`Server is running on port 3000`);
});
