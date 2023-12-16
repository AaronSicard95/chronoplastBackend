const express = require("express");
const User = require("../models/user");
const { ensureAdmin, adminOrSameUser, ensureSameUser } = require("../middleware/auth");
const Cart = require("../models/cart");

const router = express.Router();


router.get("/", ensureAdmin, async function(req, res, next){
    try{
        const users = await User.findAll();
        console.log(users);
        return res.json(users);
    }catch(err){
        return next(err);
    }
})

router.get('/:username', adminOrSameUser, async function(req,res,next){
    try{
        const userInfo = await User.get(req.params.username);
        return res.json(userInfo);
    }catch(err){
        return err;
    }
})

router.post('/:username/cart/:id', ensureSameUser, async function(req,res,next){
    try{
        const {username, id} = req.params;
        const result = await Cart.addToCart(username, id);
        return res.status(201).json(result);
    }catch(err){
        next(err);
    }
})

router.delete('/:username/cart/:id', ensureSameUser, async function(req,res,next){
    try{
        const {username, id} = req.params;
        const result = await Cart.removeFromCart(username, id);
        return res.json(result);
    }catch(err){
        return err;
    }
})

router.get('/:username/cart', adminOrSameUser, async function(req,res,next){
    try{
        const username = req.params.username;
        const result = await Cart.getUserCart(username);
        return res.json(result);
    }catch(err){
        console.log(err);
        return err;
    }
})

router.patch('/:username', ensureSameUser, async function(req,res,next){
    try{
        const result = await User.editUser(req.params.username, req.body);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

router.post('/:username/password', ensureSameUser, async function(req,res,next){
    try{
        const result = await User.checkPassword(req.params.username, req.body.password);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})
module.exports = router;