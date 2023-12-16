const db = require("../db");
const Listing = require("./listing");

class Cart{

    static async addToCart(username, listing_id){
        try{
            const result = await db.query(
                `INSERT INTO carts
                (username, listing_id)
                VALUES ($1, $2)
                RETURNING username, listing_id`,
                [username, listing_id]
            );
            return "Added to Cart";
        }catch(err){
            return err;
        }
    }

    static async removeFromCart(username, listing_id){
        try{
            console.log(username, listing_id);
            const result = await db.query(
                `DELETE FROM carts
                WHERE username=$1 AND listing_id=$2`,
                [username, listing_id]
            );
            console.log(result);
            return "deleted";
        }catch(err){
            console.log(err);
            return err;
        }
    }

    static async emptyCart(username){
        try{
            const result = await db.query(
                `DELETE FROM carts
                WHERE username=$1`,
                [username]
            );
            return "deleted";
        }catch(err){
            return err;
        }
    }

    static async getUserCart(username){
        try{
            const result = await db.query(
                `SELECT listing_id
                FROM carts
                WHERE username = $1`,
                [username]
            );
            let items = [];
            for(let listing of result.rows){
                const res = await Listing.getListingByID(listing.listing_id);
                items.push(res);
            }
            return items;
        }catch(err){
            return err;
        }
    }
}

module.exports=Cart;