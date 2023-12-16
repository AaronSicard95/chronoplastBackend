const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForAdditionInsert, sqlForPatrialUpdate } = require("../helpers/sql");

class Band{

    //Make a band
    static async makeBand(band){
        console.log(band);
        const additional = sqlForAdditionInsert(band, ['name'])
        const result = await db.query(
            `INSERT INTO bands
            (name${additional.columns})
            VALUES ($1${additional.values})
            RETURNING id, name, bio, origin, imageURL`,
            [band.name, ...additional.vals]
        )
        const newBand = result.rows[0];
        return newBand;
    }

    static async findAllBands(filters={}){
        let queryFilters = [];
        let keys = [];
        queryFilters = !filters.name?queryFilters:[...queryFilters, `%${filters.name}%`];
        keys = !filters.name?keys:[...keys, "name"];
        queryFilters = !filters.bio?queryFilters:[...queryFilters, `%${filters.bio}%`];
        keys = !filters.bio?keys:[...keys, "bio"];
        

        let wherePhrase = "";
        if(queryFilters.length>0){
            wherePhrase = `WHERE `;
            for(let i = 0; i<queryFilters.length; i++){
                if(i!=0)wherePhrase = `${wherePhrase} OR `;
                wherePhrase = `${wherePhrase} ${keys[i]} ILIKE $${i+1}`
            }
        }

        const result = await db.query(
            `SELECT id, name, bio, origin, imageURL
            FROM bands
            ${wherePhrase}`,
            queryFilters
        );
        return result.rows;
    }

    static async findBandByName(name){
        const result = await db.query(
            `SELECT id, name, bio, origin, imageURL
            FROM bands
            WHERE name = $1`,
            [name]
        );
        return result.rows[0]||undefined;
    }

    static async getBand(id){
            const result = await db.query(`
            SELECT id, name, bio, origin, imageURL
            FROM bands 
            WHERE id = $1`,
            [id]);
            if(!result.rows[0])throw new NotFoundError(`No band with id: ${id} exists`);
            const genreRes = await db.query(`
            SELECT g.name, g.id
            FROM genres g
            JOIN genrebands b
            ON b.genre_id=g.id
            WHERE b.band_id=$1`,
            [id]);
            const recordRes = await db.query(`
            SELECT r.id, r.title, r.imageURL
            FROM records r
            WHERE r.band_id = $1`,
            [id]);
            const band = {...result.rows[0], genres: genreRes.rows, records: recordRes.rows};
            return band;
    }

    static async updateBand(id, data){
            const {statement, vals} = sqlForPatrialUpdate(data);
            const idIndex = vals.length+1;
            const result = await db.query(
                `UPDATE bands
                SET ${statement}
                WHERE id = $${idIndex}
                RETURNING id, name, bio, origin, imageURL`,
                [...vals, id]
            )
            return result.rows[0];
    }

    static async deleteBand(id){
            const check = await db.query(`
            SELECT id, name
            FROM bands
            WHERE id = $1`,
            [id]);
            if(!check.rows[0])throw new NotFoundError(`Band with id of ${id} does not exist`);
            const result = await db.query(
                `DELETE FROM bands
                WHERE id = $1`,
                [id]
            )
            return `Deleted band: ${check.rows[0].name}`;
    }
}

module.exports = Band;