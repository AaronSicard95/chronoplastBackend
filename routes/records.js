const express = require('express');
const { AWS_SECRET_KEY, AWS_ID } = require('../config');
const {S3Client} = require('@aws-sdk/client-s3');
const s3 = new S3Client({region:"us-east-1",
credentials:{secretAccessKey:AWS_SECRET_KEY,
accessKeyId:AWS_ID}});
const multerS3 = require('multer-s3');
const multer = require("multer");
const upload = multer({storage: multerS3({
    s3:s3,
    bucket: 'chronoplastphotos',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function(req,file,next){
    next(null,file.originalname.split('.')[0]+Date.now() +'.'+ file.originalname.split('.').pop())}
  })
});
const jsonschema = require ('jsonschema');
const Record = require('../models/record');
const Band = require('../models/band');
const Order = require('../models/order');
const { checkLoggedIn, ensureAdmin, ensureSameUser } = require('../middleware/auth');
const router = express.Router();
const newRecordSchema = require('../schemas/recordNew.json');
const updateRecordSchema = require('../schemas/recordUpdate.json');
const { BadRequestError } = require('../expressError');
const Genre = require('../models/genre');
const Review = require('../models/review');
const Listing = require('../models/listing');

router.get('/', async function(req,res,next){
    try{
        const records = await Record.findAll(req.query);
        return res.json(records);
    }catch(err){
        return next(err);
    }
})

router.get('/top', async function(req,res,next){
    try{
        const records = await Record.topFive();
        return res.json(records);
    }catch(err){
        return next(err);
    }
})

router.post('/', upload.single('image'), ensureAdmin, async function(req,res,next){
    try{
        const record = req.body;
        const validator = jsonschema.validate(record, newRecordSchema);
        if(!validator.valid) throw new BadRequestError("Not valid record data");
        const existingBand = await Band.findBandByName(record.band);
        if(existingBand){
            record.band_id = existingBand.id;
        }else{
            const newBand = await Band.makeBand({name: record.band});
            record.band_id = newBand.id;
        }
        recordData = {title: record.title, band_id: record.band_id};
        if(req.file){
            recordData = {...recordData, "imageURL": req.file.location};
            console.log("added location");
        }
        const newRecord = await Record.makeRecord(recordData);
        console.log("made record");
        for(let genre of record.genres){
            await Genre.attachToRecord(newRecord.id, genre);
        }
        return res.status(201).json({newRecord});
    }catch(err){
        return next(err);
    }
})

router.post('/order/:id', checkLoggedIn, async function(req,res,next){
    try{
        const user = res.locals.user;
        const id = req.params.id;
        const result = await Order.makeOrder(id, user.username);
        return res.status(201).json(result);
    }catch(err){
        return err;
    }
})

router.patch('/:id', upload.single('image'), ensureAdmin, async function(req,res,next){
    try{
        let record = req.body;
        if(req.file){
            record = {...record, "imageURL": req.file.location};
        }
        delete record.image;
        const validator = jsonschema.validate(record, updateRecordSchema);
        if(!validator.valid) throw new BadRequestError("Not valid record data");
        if(record.band){
            const existingBand = await Band.findBandByName(record.band);
            if(existingBand){
                record.band_id = existingBand.id;
            }else{
                const newBand = await Band.makeBand({name: record.band});
                record.band_id = newBand.id;
            }
            record = {...record, band_id: record.band_id};
        }
        const genres = record.genres;
        delete record.genres;
        delete record.band;
        const newRecord = await Record.update(req.params.id, record);
        await Genre.detachAllFromRecord(newRecord.id);
        for(let genre of genres){
            await Genre.attachToRecord(newRecord.id, genre);
        }
        return res.status(200).json({newRecord});
    }catch(err){
        return next(err);
    }
})

router.delete('/:id', ensureAdmin, async function(req,res,next){
    try{
        const result = await Record.deleteRecord(req.params.id);
        return res.json(`Successfully Delete ${result.title} (id#${result.id})`);
    }catch(err){
        return next(err);
    }
})

router.get('/:id/listings', async function(req,res,next){
    try{
        const id = req.params.id;
        const result = await Listing.getRelatedListings(id);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

router.post('/:id/listings', ensureAdmin, upload.single('image'), async function(req,res,next){
    try{
        const id = req.params.id;
        let listing = req.body;
        listing = {...listing, record_id: id};
        if(req.file){
            listing={...listing, imageURL: req.file.path};
        };
        const result = await Listing.addListing(listing);
        return res.status(201).json(result);
    }catch(err){
        return next(err);
    }
})

router.patch('/:id/listings/:lid', ensureAdmin, upload.single('image'), async function(req,res,next){
    try{
        const id = req.params.lid;
        const listing = req.body;
        if(req.file){
            listing={...listing, imageURL: req.file.location};
        }
        const result = Listing.updateListing(id,listing);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

router.post('/:id/:username', ensureSameUser, async function(req,res,next){
    try{
        const result = await Review.addReview({username:req.params.username,record_id:req.params.id,...req.body});
        return res.status(201).json(result);
    }catch(err){
        return next(err);
    }
})

router.patch('/:id/:username', ensureSameUser, async function(req,res,next){
    try{
        const result = await Review.updateReview(req.params.id, req.params.username, req.body);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

router.delete('/:id/:username', ensureSameUser, async function(req,res,next){
    try{
        const result = await Review.deleteReview(req.params.id);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

router.get('/:id/reviews', async function(req,res,next){
    try{
        const result = await Review.getReviews(req.params.id);
        return res.json(result);
    }catch(err){
        return next(err);
    }
})

router.get('/:id', async function(req,res,next){
    try{
        const id = req.params.id;
        const record = await Record.findRecord(id);
        return res.json(record);
    }catch(err){
        return next(err);
    }
})

module.exports = router;