const db = require("../db");
const { sqlForPatrialUpdate, sqlForAdditionInsert } = require("../helpers/sql");
const {BadRequestError} = require('../expressError');

class Listing{

    static async addListing(listing){
        try{
            const helper = sqlForAdditionInsert(listing, ["quality"]);
            const result = await db.query(`
            INSERT INTO listings
            (quality${helper.columns})
            VALUES($1${helper.values})
            RETURNING id, quality, price, stock, record_id`,
            [listing.quality, ...helper.vals]);
            return result.rows[0];
        }catch(err){
            return err;
        }
    }

    static async getRelatedListings(record_id){
        try{
            const result = await db.query(`
            SELECT id, quality, price, stock, imageURL
            FROM listings
            WHERE record_id=$1`,
            [record_id]);
            return result.rows;
        }catch(err){
            return err;
        }
    }

    static async getAllListings(){
        try{
            const result = await db.query(`
            SELECT l.id, l.quality, l.price, l.stock, l.imageURL, l.record_id, r.title AS record
            FROM listings l
            JOIN records r ON r.id=l.record_id`);
            return result.rows;
        }catch(err){
            return err;
        }
    }

    static async updateListing(id, data){
        try{
            const {statement, vals} = sqlForPatrialUpdate(data);
            const idIndex = vals.length+1;
            const res = await db.query(`
            UPDATE listings
            SET ${statement}
            WHERE id = $${idIndex}
            RETURNING id, quality, price, stock, imageURL, record_id`,
            [...vals, id]);
            return res.rows[0];
        }catch(err){
            return err;
        }
    }

    static async getListingByID(id){
        try{
            const result = await db.query(
                `SELECT id, price, stock, imageURL, record_id
                FROM listings
                WHERE id=$1`,
                [id]
            );
            let listing = result.rows[0];
            const recordRes = await db.query(
                `SELECT r.id, r.title, r.band_id, r.imageURL, b.name AS bandname
                FROM records R
                JOIN bands b ON b.id = r.band_id
                WHERE r.id=$1`,
                [listing.record_id]
            );
            const record = recordRes.rows[0];
            listing.record = record;
            return listing;
        }catch(err){
            return err;
        }
    }

    static async removeStock(id, amount=1){
        try{
            const listingCheck = await db.query(
                `SELECT id, stock
                FROM listings 
                WHERE id = $1`,
                [id]
            );
            const listing = listingCheck.rows[0];
            if(!listing)throw new BadRequestError("Listing does not exist");
            const result = await db.query(
                `UPDATE listings
                SET stock = $1
                WHERE id = $2`,
                [listing.stock-amount, id]
            );
            return result.rows[0];
        }catch(err){
            return err;
        }
    }
}

module.exports=Listing;