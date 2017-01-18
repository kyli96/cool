"use strict";
const bunyan = require("bunyan");
const config = require("config");

const logLevel = config.hasOwnProperty("logLevel") ? config.logLevel : "info";

const streams = [{
    level: logLevel,
    stream: process.stdout
}];

if(config.hasOwnProperty("logPath")){
    streams.push({type: "rotating-file", period: "1d", count:7 , level: logLevel, path: config.logPath});
}

const logger = bunyan.createLogger({
    name: "api",
    streams: streams
});

module.exports = logger;
