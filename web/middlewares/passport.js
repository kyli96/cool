"use strict";
const passport = require("passport");
// const JWTStrategy = require("./JWTStrategy");
const express = require("express");
const router = express.Router();

const serializeUser = function () {
    return function (employee, done) {
        done(null, employee);
    };
};

const deserializeUser = function () {
    return function (obj, done) {
        done(null, obj);
    };
};

module.exports = function (app) {
    // passport.use(JWTStrategy.Strategy);
    passport.serializeUser(serializeUser());
    passport.deserializeUser(deserializeUser());

    app.use(passport.initialize());

    return passport;
};
