"use strict";
global.BASEDIR  = __dirname;

const _s = require("underscore.string");
const constant = require("./common/constant");
const express = require("express");
const path = require("path");
const url = require("url");
const favicon = require("serve-favicon");
const logger = require("./middlewares/logger");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const errorhandler = require("errorhandler");
const compression = require("compression");
const requestId = require("request-id/express");
const methodOverride = require("method-override");
const cors = require("cors");
const moment = require("moment");
const db = require("../models/rdb");
const ienoopen = require("ienoopen");

const redis = require("./middlewares/redis");
const passport = require("./middlewares/passport");
const RedisStore = require("connect-redis")(session);

const app = express();

global.ENV = app.get("env");

const routes = require("./routes/index");

app.set(db, db);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("logger",logger);

// security
app.disable("x-powered-by");
app.use(ienoopen());


// parse application/vnd.api+json as json
app.use(bodyParser.json({limit: 1024 * 1024 * 16 , type: "application/vnd.api+json"}));
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, "public")));

const whitelist = [
    ".lishouse.com"
];
const corsOptions = {
    origin: function (origin, callback) {
        const originHost = "." + (origin && url.parse(origin).hostname || "");
        const originIsWhitelisted = whitelist.some(function (host) {
            return _s.endsWith(originHost, host);
        });
        callback(null, originIsWhitelisted);
    },
    credentials: true
};
app.options("*", cors(corsOptions));

app.all("*", cors(corsOptions));

app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("_method"));
app.use(requestId());
app.use(cookieParser());

app.use(session({
    store: new RedisStore({client: redis, ttl: constant.session_ttl}),
    secret: "mycmssecret",
    resave: false,
    cookie: {maxAge: constant.session_ttl * 1000}
}));

global.i18n = new (require("i18n-2"))({
    locales: ["zh_TW", "en_US"],
    directory: BASEDIR + "/lang",
    defaultLocale: "zh_TW",
    extension: ".json",
    cookieName: "locale"
});

app.use(function (req, res, next) {
    i18n.setLocaleFromQuery(req);
    i18n.setLocaleFromCookie(req);
    next();
});

// passport(app);

// load all routers in routes/index.js
routes(app);

// / catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error("Not Found Page.");
    err.statusCode = 404;
    next(err);
});

// error handlers
if (app.get("env")=="" || app.get("env") === "development" || app.get("env") === "staging") {
    // only use in development
    app.use(function (err, req, res, next) {
        if(err instanceof db.Sequelize.ValidationError) {
            res.status(403);
            let mgs = err.errors.map(err=>{
                return i18n.__(err.message);
            });
            res.json({
                message: mgs.join(";")+ "。",
                error: err,
                stack: err.stack
            });
        }else{
            res.status(err.statusCode || 500);
            res.json({
                message: (err.errors && err.errors.length > 0)? err.errors[0].message: err.message,
                error: err,
                stack: err.stack
            });
        }
    });
}

if (app.get("env") === "production") {
    // only use in production
    app.use(compression());
    app.use(function (err, req, res, next) {
        res.status(err.statusCode || 500);
        res.json({
            message: (err.errors && err.errors.length > 0)? err.errors[0].message: err.message
            // error: err
        });
        logger.warn(JSON.stringify({err: err , stack: err.stack}));
    });
    process.on("uncaughtException", function (err) {
        logger.warn(err);
    });
}
module.exports = app;
