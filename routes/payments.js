const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const {v4: uuid} = require('uuid');
const { ensureAdmin } = require('../middleware/auth');

router.post('/', ensureAdmin, async function(req,res,next){
    try{
        const amount = req.body.amount;
        const result = await Payment.createPayment(amount);
        return res.status(201).json(result.result.status);
    }catch(err){
        return next(err);
    }
})

module.exports=router;