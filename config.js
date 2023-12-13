const SECRET_KEY = process.env.SECRET_KEY || "SUPER_SECRET";
const PORT = process.env.PORT ||3001;
const accessToken = "EAAAEPNV2vMOAGUU9JwJrsqLiAYIeoiEoPsnuaFfSsA_9Ryd5qo3QVwOL-kozzth";

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
    accessToken
}