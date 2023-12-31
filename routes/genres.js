const express = require('express');
const Genre = require('../models/genre');
const { ensureAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async function(req,res,next){
    try{
        const search = req.query.search||"";
        const genres = await Genre.findAll(search);
        return res.json(genres);
    }catch(err){
        return next(err);
    }
})

router.post('/', ensureAdmin, async function(req,res,next){
    try{
        const result = await Genre.makeGenre(req.body);
        return res.status(201).json(result);
    }catch(err){
        return next(err);
    }
})

router.get('/:id', async function(req,res,next){
    try{
        const result = await Genre.getRelated(req.params.id);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

module.exports=router;