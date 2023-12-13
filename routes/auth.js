const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const { ensureAdmin, ensureSameUser } = require("../middleware/auth");


router.post("/login", async function(req, res, next){
    try{
        const user = req.body;
        const result = await User.login(user);
        const token = createToken(result);
        console.log(result);
        return res.json({token,username: result.username, admin: result.isadmin});
    }catch(err){
        return next(err);
    }
})


router.post("/register", async function(req,res,next){
    try{
        const user = req.body;
        const newUser = await User.create(user);
        const token = createToken(newUser);
        return res.status(201).json({token,username: result.username, admin: newUser.isadmin});
    }catch(err){
        return next(err);
    }
})


router.post("/register/admin", ensureAdmin, async function(req,res,next){
    try{
        const user = req.body;
        const loggedInUser = {username: res.locals.user.username, password: user.passCheck, isAdmin: res.locals.user.isAdmin};
        const newUser = await User.createAdmin(user, loggedInUser);
        return res.status(201).json({newUser});
    }catch(err){
        return next(err);
    }
})

module.exports = router;