const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const {ensureSameUser}=require('../middleware/auth');
const Listing = require('../models/listing');
const Payment = require('../models/payment');

router.post('/:username/checkout', ensureSameUser, async function(req,res,next){
    try{
        let total = 0;
        let items = await Cart.getUserCart(req.params.username);
        for(let item of items){
            total+=item.price;
            await Listing.removeStock(item.id);
        };
        await Payment.createPayment(total);
        await Cart.emptyCart(req.params.username);
        return res.json(`Order Completed Successfuly! You were charged $${total}`);
    }catch(err){
        return next(err);
    }
})

module.exports=router;