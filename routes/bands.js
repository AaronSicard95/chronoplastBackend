const express = require ('express');
const { AWS_SECRET_KEY, AWS_ID } = require('../config');
const Band = require('../models/band');
const { ensureAdmin } = require('../middleware/auth');
const router = express.Router();
const {S3Client, DeleteObjectCommand} = require('@aws-sdk/client-s3');
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
const Genre = require('../models/genre');

router.get('/', async function(req,res,next){
    try{
        const bands = await Band.findAllBands(req.query);
        return res.json(bands);
    }catch(err){
        return next(err);
    }
})

router.get('/:id', async function(req,res,next){
    try{
        const band = await Band.getBand(req.params.id);
        return res.json(band);
    }catch(err){
        return next(err);
    }
})

router.post('/', upload.single('image'), ensureAdmin, async function(req,res,next){
    try{
        let band = req.body;
        const genres = !band.genres?[]:band.genres;
        delete band.genres;
        if(req.file){
            band= {...band, imageURL: req.file.location};
        }
        delete band.image;
        const newBand = await Band.makeBand(band);
        for(let genre of genres){
            Genre.attachToBand(newBand.id, genre);
        }
        return res.status(201).json(newBand);
    }catch(err){
        return next(err);
    }
})

router.patch('/:id', upload.single('image'), ensureAdmin, async function(req,res,next){
    try{
        let band = req.body;
        const genres = !band.genres?[]:band.genres;
        delete band.genres;
        if(req.file){
            band.imageURL = req.file.location;
        }
        delete band.image;
        const newBand = await Band.updateBand(req.params.id, band);
        await Genre.detachAllFromBand(req.params.id);
        for(let genre of genres){
            await Genre.attachToBand(newBand.id, genre);
        }
        return res.json(newBand);
    }catch(err){
        return next(err);
    }
})

router.delete('/:id', ensureAdmin, async function(req,res,next){
    try{
        const result = await Band.deleteBand(req.params.id);
        const command = new DeleteObjectCommand({
            Bucket: 'chronoplastphotos',
            Key: result.imageurl.split('amazonaws.com/')[1]
        })
        const response = await s3.send(command);
        return res.status(200).json(`Successfully deleted ${result.name} (id#${result.id})`);
    }catch(err){
        return next(err);
    }
})



module.exports = router;