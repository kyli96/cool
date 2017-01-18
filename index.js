#!/usr/bin/env node

const _ = require("underscore");
const debug = require("debug")("nodegps:server");
const http = require("http");
const redis = require("redis");
const config = require("config").get("redis");
const moment = require("moment");
const Promise = require("bluebird");
const logger = require("./web/middlewares/logger");

const app = require("./web");

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "4080");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

const listener = config.hasOwnProperty("pass") ?
    redis.createClient(config.port, config.host, {connect_timeout: 5000, max_attempts: 3, auth_pass: config.pass}) :
    redis.createClient(config.port, config.host, {connect_timeout: 5000, max_attempts: 3});

listener.on("error", function (err) {
    console.error("Redis Error: ", err);
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string"
        ? "Pipe " + port
        : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    debug("Listening on " + bind);
    logger.info("Listening on " + bind);
    // const arr = app._router.stack;
    //
    // console.log(_.pluck(arr, "regexp"));
}
