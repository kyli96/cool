"use strict";
const redis = require("redis");
const logger = require("./logger");
const config = require("config");
const Promise = require("bluebird");
Promise.promisifyAll(require("redis"));

//const env = process.env.NODE_ENV || "production";
const redisConfig = config.get("redis");
const client = redisConfig.hasOwnProperty("pass") ? 
    redis.createClient( redisConfig.port, redisConfig.host, { connect_timeout : 5000, max_attempts : 3 , auth_pass : redisConfig.pass} ) :
    redis.createClient( redisConfig.port, redisConfig.host, { connect_timeout : 5000, max_attempts : 3 } ) ;

client.on("error", function (err) {
    logger.error("Redis Error: ", err);
});

module.exports = client;
