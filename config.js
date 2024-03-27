require('dotenv').config()

let config = {};

config.hostname  = process.env.HOST       || "localhost";
config.port      = process.env.PORT       || 3000;
config.buildWith = process.env.BUILD_WITH || "local";

module.exports = config;
