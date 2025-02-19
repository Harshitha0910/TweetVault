const express = require('express');
const bcrypt = require('bcrypt');
const userModel = require('../models/user.js');
const jwt=require("jsonwebtoken")

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.genSalt(10,(err,salt)=>{
        // console.log(salt)
        bcrypt.hash(password,salt,async (err,hash)=>{
            // console.log(hash)
            let createdUser=await userModel.create({
                username,
                email,
                password:hash,
            })
            let token=jwt.sign({email},JWT_SECRET) 
            res.cookie("token",token); 
            res.redirect("/login")
        })
    })

});

router.get('/login', (req, res) => {
    res.render('login');
});


router.post('/login', async (req, res) => {
    let user = await userModel.findOne({email: req.body.email})
    if (!user) return res.send("Something went wrong")

    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if(result){
            let token = jwt.sign({email: user.email}, "chuppppppp")
            res.cookie("token", token, { httpOnly: true }); // Set the token as a cookie
            res.redirect('/dashboard');
        } 
        else res.send("Wrong Credentials")
    })
});

router.get('/logout', (req, res) => {
    res.cookie("token"," ")
    res.redirect('/');
});

module.exports = router;
