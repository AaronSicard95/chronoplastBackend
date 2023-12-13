const {Client, Environment} = require('square');
const {accessToken} = require('./config'); 

const client = new Client({
    accessToken: accessToken,
    environment: Environment.Sandbox
});

module.exports = client;