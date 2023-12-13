const express = require('express');
const Listing = require('../models/listing');
const router = express.Router();

router.get('/', async function(req,res,next){
    try{
        const result = await Listing.getAllListings();
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

module.exports=router;