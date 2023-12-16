const db=require("../db");
const bcrypt = require("bcrypt");

const {BCRYPT_WORK_FACTOR} = require("../config");
const { BadRequestError, UnauthorizedError, NotFoundError } = require("../expressError");
const Order = require("./order");
const { sqlForPatrialUpdate } = require("../helpers/sql");

class User{

    //Get user by username
    static async get(username){
        try{
            const getUser = await db.query(
                `SELECT username, handle, email
                FROM users
                WHERE username = $1`,
                [username]
            )
            const AUser = getUser.rows[0];
            if(!AUser){
                throw new NotFoundError("No such user exists");
            }
            return AUser;
        }catch(err){
            return (err);
        }
    }

    static async findAll(){
        try{
            const results = await db.query(
                `SELECT username, handle, isAdmin, email
                FROM users`
            )
            const users = results.rows;
            return users;
        }catch(err){
            return err;
        }
    }

    //creates a new User
    static async create(user){
        const dupeCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [user.username]
        );

        if(dupeCheck.rows[0]){
            throw new BadRequestError(`Username: ${user.username} already taken`);
        }

        const bPassword = await bcrypt.hash(user.password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
            (username, password, handle, email, isAdmin)
            VALUES ($1, $2, $3, $4, FALSE)
            RETURNING username, handle, email, isAdmin`,
            [user.username, bPassword, user.handle, user.email]
        )

        const newUser = result.rows[0];

        return newUser;
    }

    //Creates a new admin user if request is from an admin
    static async createAdmin(user, admin){
        const dupeCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [user.username]
        );

        if(dupeCheck.rows[0]){
            throw new BadRequestError(`Username: ${user.username} already taken`);
        }

        const adminCheck = await db.query(
            `SELECT username, password, isAdmin
            FROM users
            WHERE username = $1`,
            [admin.username]
        )

        const getAd = adminCheck.rows[0];

        //const isAuthorized = await bcrypt.compare(admin.password, getAd.password);

        /*if(!isAuthorized || !getAd.isAdmin){
            throw new UnauthorizedError(`Only Admins can create Admin Accounts`);
        }*/

        const bPassword = await bcrypt.hash(user.password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
            (username, password, handle, email, isAdmin)
            VALUES ($1, $2,$3,$4, TRUE)
            RETURNING username, handle, email, isAdmin`,
            [user.username, bPassword, user.handle, user.email]
        )

        const newUser = result.rows[0];
        return newUser;
    }

    static async login(user){
        try{
                const result = await db.query(
                `SELECT username, password, isAdmin
                FROM users
                WHERE username = $1`,
                [user.username]
            )
            const userCheck = result.rows[0];
            if(!userCheck)throw new BadRequestError("Username does not exist (case sensitive)");
            if(!bcrypt.compare(user.password, userCheck.password)) throw new BadRequestError("username/password do not match");
            return {username: userCheck.username, isadmin: userCheck.isadmin};
        }catch(err){
            return err;
        }
    }

    static async editUser(username, data){
        try{
            const {statement, vals} = sqlForPatrialUpdate(data);
            const idIndex=vals.length+1;
            const res = await db.query(
                `UPDATE users
                SET ${statement}
                WHERE username = $${idIndex}
                RETURNING username, handle, email, isAdmin`,
                [...vals, username]
            );
            console.log(res);
            return res.rows[0];
        }catch(err){
            return err;
        }
    }

    static async checkPassword(username, password){
        try{
            const userInfo = await db.query(
                `SELECT username, password
                FROM users
                WHERE username = $1`,
                [username]
            );
            const user = userInfo.rows[0];
            if(!user)throw new BadRequestError("User does nto exist");
            const passCheck = await bcrypt.compare(password, user.password);
            if(!passCheck)return false;
            return true;
        }catch(err){
            return err;
        }
    }
}

module.exports= User;