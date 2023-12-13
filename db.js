const {Client} = require("pg");
const {getDatabaseUri} = require("./config");

let db;

/*if(process.env.NODE_ENV === "production"){
    db = new Client({
        user: 'postgres',
        host: 'localhost',
        database: getDatabaseUri(),
        password: 'postgres',
        port: 5432,
        ssl: {
          rejectUnauthorized: false
        }
      });
    } else {
      db = new Client({
        user: 'postgres',
        host: 'localhost',
        database: getDatabaseUri(),
        password: 'postgres',
        port: 5432,
    });
}*/

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}

db.connect();

module.exports = db;