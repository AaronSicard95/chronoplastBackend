const { default: axios } = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "SUPER_SECRET";
const PORT = process.env.PORT ||3001;
const accessToken = process.env.SQUARE_TOKEN||"";
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY||"";
const AWS_ID = process.env.AWS_ID||"";
const PAYPAL_USERNAME=process.env.PAYPAL_USERNAME||"";
const PAYPAL_PASSWORD=process.env.PAYPAL_PASSWORD||"";

function getDatabaseUri(){
    return (process.env.NODE_ENV==="test")?
    "chronoplast_test":process.env.DATABASE_URL||"chronoplast";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV==="test"?1:13;

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri,
    accessToken,
    AWS_SECRET_KEY,
    AWS_ID,
    PAYPAL_PASSWORD,
    PAYPAL_USERNAME
}